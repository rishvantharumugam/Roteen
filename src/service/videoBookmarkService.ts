import { supabase } from "@/lib/supabase";
import { getCachedAuthenticatedUserId } from "@/lib/authUserCache";

export type UserPlaylist = {
  id: string;
  title: string;
  pinned: boolean;
  containsCurrentQuestion?: boolean;
};

export type BookmarkQuestionContext = {
  questionId: string;
  questionTitle: string;
  chapterId?: string | null;
  videoUrl?: string | null;
};

type PlaylistRow = {
  id: string | number | null;
  title: string | null;
  pinned: boolean | null;
};

let mappingTableAvailable: boolean | null = null;

async function requireAuthenticatedUserId(): Promise<string> {
  return getCachedAuthenticatedUserId();
}

async function ensureMappingTableAvailable(): Promise<boolean> {
  if (mappingTableAvailable !== null) {
    return mappingTableAvailable;
  }

  const { error } = await supabase.from("quickrevision_lists_Items").select("id").limit(1);
  if (!error) {
    mappingTableAvailable = true;
    return true;
  }

  if (error.code === "PGRST205") {
    mappingTableAvailable = false;
    return false;
  }

  throw new Error(error.message);
}

async function assertPlaylistOwnership(playlistId: string, userId: string): Promise<void> {
  const { data, error } = await supabase
    .from("quickrevision_lists")
    .select("id")
    .eq("id", playlistId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Playlist not found or access denied.");
  }
}

export const VideoBookmarkService = {
  fetchUserPlaylistsFromDb: async (questionId?: string): Promise<UserPlaylist[]> => {
    const userId = await requireAuthenticatedUserId();

    const { data, error } = await supabase
      .from("quickrevision_lists")
      .select("id, title, pinned")
      .eq("user_id", userId)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const playlists = ((data ?? []) as PlaylistRow[]).map((row) => ({
      id: String(row.id ?? ""),
      title: row.title ?? "Untitled Playlist",
      pinned: Boolean(row.pinned),
      containsCurrentQuestion: false,
    }));

    if (questionId && playlists.length > 0) {
      const playlistIds = playlists.map(p => p.id);
      const { data: mappingData, error: mappingError } = await supabase
        .from("quickrevision_lists_Items")
        .select("quickrevision_lists_id")
        .eq("questions_id", questionId)
        .in("quickrevision_lists_id", playlistIds);

      if (!mappingError && mappingData) {
        const containsIds = new Set(mappingData.map(m => String(m.quickrevision_lists_id)));
        for (const p of playlists) {
          if (containsIds.has(p.id)) {
            p.containsCurrentQuestion = true;
          }
        }
      }
    }

    return playlists;
  },

  createPlaylistForUserInDb: async (title: string): Promise<string> => {
    const userId = await requireAuthenticatedUserId();
    const normalizedTitle = title.trim() || "New Playlist";

    const { data, error } = await supabase
      .from("quickrevision_lists")
      .insert([
        {
          user_id: userId,
          title: normalizedTitle,
          pinned: false,
        },
      ])
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return String(data.id);
  },

  isQuestionBookmarkedInDb: async (questionId: string): Promise<boolean> => {
    const userId = await requireAuthenticatedUserId();
    const tableAvailable = await ensureMappingTableAvailable();
    if (!tableAvailable) {
      return false;
    }

    const { data: userPlaylists, error: plError } = await supabase
      .from("quickrevision_lists")
      .select("id")
      .eq("user_id", userId);
      
    if (plError || !userPlaylists || userPlaylists.length === 0) {
      return false;
    }
    
    const playlistIds = userPlaylists.map(p => p.id);

    const { data, error } = await supabase
      .from("quickrevision_lists_Items")
      .select("id")
      .eq("questions_id", questionId)
      .in("quickrevision_lists_id", playlistIds)
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    return (data?.length ?? 0) > 0;
  },

  addQuestionToPlaylistInDb: async (
    playlistId: string,
    context: BookmarkQuestionContext,
  ): Promise<void> => {
    const userId = await requireAuthenticatedUserId();
    const tableAvailable = await ensureMappingTableAvailable();

    if (!tableAvailable) {
      throw new Error(
        "Missing table: quickrevision_lists_Items. Please create quickrevision_lists_Items to store bookmarked video-question mappings.",
      );
    }

    await assertPlaylistOwnership(playlistId, userId);

    const { data: existingRows, error: existingError } = await supabase
      .from("quickrevision_lists_Items")
      .select("*")
      .eq("quickrevision_lists_id", playlistId)
      .eq("questions_id", context.questionId)
      .limit(1);

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (existingRows && existingRows.length > 0) {
      throw new Error("Already added to this playlist");
    }

    const { data: items, error: posError } = await supabase
      .from("quickrevision_lists_Items")
      .select("position")
      .eq("quickrevision_lists_id", playlistId)
      .order("position", { ascending: false })
      .limit(1);

    if (posError) {
      throw new Error(posError.message);
    }

    const nextPosition = (items && items.length > 0 && items[0].position != null) 
      ? Number(items[0].position) + 1 
      : 1;

    const { error: insertError } = await supabase.from("quickrevision_lists_Items").insert([
      {
        quickrevision_lists_id: playlistId,
        questions_id: context.questionId,
        position: nextPosition,
      },
    ]);

    if (insertError) {
      throw new Error(insertError.message);
    }
  },

  toggleQuestionInPlaylistInDb: async (
    playlistId: string,
    context: BookmarkQuestionContext,
  ): Promise<"added" | "removed"> => {
    const userId = await requireAuthenticatedUserId();
    const tableAvailable = await ensureMappingTableAvailable();

    if (!tableAvailable) {
      throw new Error(
        "Missing table: quickrevision_lists_Items. Please create quickrevision_lists_Items to store bookmarked video-question mappings.",
      );
    }

    await assertPlaylistOwnership(playlistId, userId);

    const { data: existingRows, error: existingError } = await supabase
      .from("quickrevision_lists_Items")
      .select("id")
      .eq("quickrevision_lists_id", playlistId)
      .eq("questions_id", context.questionId)
      .limit(1);

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (existingRows && existingRows.length > 0) {
      const { error: deleteError } = await supabase
        .from("quickrevision_lists_Items")
        .delete()
        .eq("quickrevision_lists_id", playlistId)
        .eq("questions_id", context.questionId);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      return "removed";
    }

    const { data: items, error: posError } = await supabase
      .from("quickrevision_lists_Items")
      .select("position")
      .eq("quickrevision_lists_id", playlistId)
      .order("position", { ascending: false })
      .limit(1);

    if (posError) {
      throw new Error(posError.message);
    }

    const nextPosition = (items && items.length > 0 && items[0].position != null)
      ? Number(items[0].position) + 1
      : 1;

    const { error: insertError } = await supabase.from("quickrevision_lists_Items").insert([
      {
        quickrevision_lists_id: playlistId,
        questions_id: context.questionId,
        position: nextPosition,
      },
    ]);

    if (insertError) {
      throw new Error(insertError.message);
    }

    return "added";
  },
};
