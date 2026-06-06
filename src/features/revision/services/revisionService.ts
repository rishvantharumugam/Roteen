import { Playlist, NewPlaylistDraft } from '@/features/revision/components/revisionTypes';
import { supabase } from '@/lib/supabase/client';
import { getCachedAuthenticatedUserId } from "@/lib/authUserCache";

type RevisionDbUpdate = {
  pinned?: boolean;
};

export type PlaylistLaunchContext = {
  playlistId: string;
  playlistTitle: string;
  questionIds: string[];
  subjectId: string | null;
  subjectTitle: string | null;
  subjectStandard: string | null;
};

async function requireAuthenticatedUserId(): Promise<string> {
  return getCachedAuthenticatedUserId();
}

export const RevisionService = {
  getAuthenticatedUserId: requireAuthenticatedUserId,

  // Pure helper functions
  togglePin: (playlists: Playlist[], id: string): Playlist[] => {
    const newPlaylists = playlists.map((p: any) => 
      p.id === id ? { ...p, isPinned: !p.isPinned } : p
    );
    
    // Sort so pinned items are at the top
    return newPlaylists.sort((a, b) => {
      if (a.isPinned === b.isPinned) return 0;
      return a.isPinned ? -1 : 1;
    });
  },

  filterPlaylists: (playlists: Playlist[], query: string): Playlist[] => {
    if (!query.trim()) return playlists;
    const lower = query.toLowerCase();
    return playlists.filter(p => 
      p.title.toLowerCase().includes(lower)
    );
  },

  // ─── OPTIMIZED: single query fetches playlists + item counts via nested select ───
  // Previously: 2 roundtrips (playlists, then item counts). Now: 1 roundtrip.
  fetchPlaylistsFromDb: async (): Promise<Playlist[]> => {
    const userId = await requireAuthenticatedUserId();

    const { data: playlists, error } = await supabase
      .from('quickrevision_lists')
      .select('id, title, pinned, created_at, quickrevision_lists_Items(id)')
      .eq('user_id', userId)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      // Fallback: if nested select fails (e.g. table name mismatch), fetch without counts
      const { data: fallback, error: fallbackError } = await supabase
        .from('quickrevision_lists')
        .select('id, title, pinned, created_at')
        .eq('user_id', userId)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (fallbackError) throw fallbackError;
      return ((fallback ?? []) as any[]).map((row) => ({
        id: row.id?.toString() || Date.now().toString(),
        title: row.title || '',
        videoCount: 0,
        isPinned: row.pinned || false,
        date: new Date(row.created_at || Date.now()).toLocaleDateString('en-GB', {
          day: '2-digit', month: '2-digit', year: 'numeric',
        }),
      }));
    }

    return ((playlists ?? []) as any[]).map((row) => ({
      id: row.id?.toString() || Date.now().toString(),
      title: row.title || '',
      videoCount: Array.isArray(row.quickrevision_lists_Items) ? row.quickrevision_lists_Items.length : 0,
      isPinned: row.pinned || false,
      date: new Date(row.created_at || Date.now()).toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      }),
    }));
  },

  addPlaylistToDb: async (draft: NewPlaylistDraft): Promise<string> => {
    const userId = await requireAuthenticatedUserId();

    const { data, error } = await supabase
      .from('quickrevision_lists')
      .insert([
        {
          user_id: userId,
          title: draft.title || 'New Playlist',
          pinned: false,
        }
      ])
      .select('id')
      .single();

    if (error) throw error;
    return data.id?.toString() || Date.now().toString();
  },

  updatePlaylistInDb: async (id: string, updates: { pinned?: boolean }): Promise<void> => {
    const userId = await requireAuthenticatedUserId();
    const dbUpdates: RevisionDbUpdate = {};
    if (updates.pinned !== undefined) dbUpdates.pinned = updates.pinned;

    if (Object.keys(dbUpdates).length === 0) return;

    const { data: updatedRow, error } = await supabase
      .from('quickrevision_lists')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', userId)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!updatedRow) {
      throw new Error('Playlist not found or access denied.');
    }
  },

  deletePlaylistFromDb: async (id: string): Promise<void> => {
    const userId = await requireAuthenticatedUserId();

    // 1. First delete all items inside the playlist to avoid foreign key constraint errors
    const { error: itemsError } = await supabase
      .from('quickrevision_lists_Items')
      .delete()
      .eq('quickrevision_lists_id', id);

    if (itemsError) throw itemsError;

    // 2. Then delete the playlist itself
    const { data: deletedRow, error } = await supabase
      .from('quickrevision_lists')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!deletedRow) {
      throw new Error('Playlist not found or access denied.');
    }
  },

  fetchPlaylistLaunchContext: async (playlistId: string): Promise<PlaylistLaunchContext> => {
    const userId = await requireAuthenticatedUserId();

    const { data: playlistRow, error: playlistError } = await supabase
      .from("quickrevision_lists")
      .select("id, title")
      .eq("id", playlistId)
      .eq("user_id", userId)
      .maybeSingle();

    if (playlistError) throw playlistError;
    if (!playlistRow) {
      throw new Error("Playlist not found or access denied.");
    }

    const { data: itemRows, error: itemsError } = await supabase
      .from("quickrevision_lists_Items")
      .select("questions_id, position")
      .eq("quickrevision_lists_id", playlistId)
      .order("position", { ascending: true });

    if (itemsError) throw itemsError;

    const orderedQuestionIds = (itemRows ?? [])
      .map((item: any) => String(item.questions_id ?? "").trim())
      .filter(Boolean);

    if (orderedQuestionIds.length === 0) {
      return {
        playlistId: String(playlistRow.id),
        playlistTitle: String(playlistRow.title ?? "Playlist"),
        questionIds: [],
        subjectId: null,
        subjectTitle: null,
        subjectStandard: null,
      };
    }

    const { data: questionRows, error: questionError } = await supabase
      .from("questions")
      .select("id, subject_id")
      .in("id", orderedQuestionIds);

    if (questionError) throw questionError;

    const subjectByQuestion = new Map<string, string>();
    (questionRows ?? []).forEach((row: any) => {
      const qid = String(row.id ?? "").trim();
      const sid = String(row.subject_id ?? "").trim();
      if (qid && sid) {
        subjectByQuestion.set(qid, sid);
      }
    });

    const firstSubjectId =
      orderedQuestionIds.map((qid: any) => subjectByQuestion.get(qid)).find(Boolean) ?? null;

    let subjectTitle: string | null = null;
    let subjectStandard: string | null = null;

    if (firstSubjectId) {
      const { data: subjectRow, error: subjectError } = await supabase
        .from("subjects")
        .select("subject_name, standard")
        .eq("id", firstSubjectId)
        .maybeSingle();

      if (!subjectError && subjectRow) {
        subjectTitle = typeof subjectRow.subject_name === "string" ? subjectRow.subject_name : null;
        subjectStandard =
          subjectRow.standard !== null && subjectRow.standard !== undefined
            ? String(subjectRow.standard)
            : null;
      }
    }

    return {
      playlistId: String(playlistRow.id),
      playlistTitle: String(playlistRow.title ?? "Playlist"),
      questionIds: orderedQuestionIds,
      subjectId: firstSubjectId,
      subjectTitle,
      subjectStandard,
    };
  },
};


