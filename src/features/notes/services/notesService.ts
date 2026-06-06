import { Note } from '@/features/notes/components/notesStore';
import { supabase } from '@/lib/supabase/client';
import { getCachedAuthenticatedUserId } from "@/lib/authUserCache";

type NoteDbUpdate = {
  title?: string;
  content?: string;
  pinned?: boolean;
};

type NoteRow = {
  id: string | number | null;
  question_id: string | null;
  subject_id?: string | null;
  title: string | null;
  content: string | null;
  pinned: boolean | null;
  created_at: string | null;
};

export type QuestionNotePayload = {
  questionId: string;
  subjectId: string | null;
  title: string;
  content: string;
  pinned?: boolean;
};

export type QuestionNoteRecord = {
  id: string;
  questionId: string;
  subjectId: string | null;
  title: string;
  content: string;
  pinned: boolean;
};

let resolvedNotesTable: 'notes' | 'user_notes' | null = null;
let notesTableHasSubjectIdColumn: boolean | null = null;

async function requireAuthenticatedUserId(): Promise<string> {
  return getCachedAuthenticatedUserId();
}

async function resolveNotesTableName(): Promise<'notes' | 'user_notes'> {
  if (resolvedNotesTable) {
    return resolvedNotesTable;
  }

  const { error } = await supabase
    .from('notes')
    .select('id')
    .limit(1);

  if (!error) {
    resolvedNotesTable = 'notes';
    return resolvedNotesTable;
  }

  if (error.code === 'PGRST205') {
    resolvedNotesTable = 'user_notes';
    return resolvedNotesTable;
  }

  throw error;
}

function formatDateLabel(value: string | null): string {
  if (!value) {
    return new Date().toLocaleDateString('en-GB');
  }

  return new Date(value).toLocaleDateString('en-GB');
}

function mapRowToNote(row: NoteRow): Note {
  return {
    id: String(row.id ?? Date.now()),
    questionId: row.question_id ?? null,
    subject: row.title ?? '',
    description: row.content ?? '',
    date: formatDateLabel(row.created_at),
    isPinned: Boolean(row.pinned),
    accentColor: '#F59E0B',
    textColor: '#C7D2FE',
  };
}

function mapRowToQuestionNote(row: NoteRow): QuestionNoteRecord {
  return {
    id: String(row.id ?? Date.now()),
    questionId: row.question_id ?? '',
    subjectId: row.subject_id ?? null,
    title: row.title ?? '',
    content: row.content ?? '',
    pinned: Boolean(row.pinned),
  };
}

function getQuestionNoteSelectClause(includeSubjectId: boolean): string {
  return includeSubjectId
    ? "id, question_id, subject_id, title, content, pinned, created_at"
    : "id, question_id, title, content, pinned, created_at";
}

async function resolveSubjectIdColumnAvailability(
  tableName: "notes" | "user_notes",
): Promise<boolean> {
  if (notesTableHasSubjectIdColumn !== null) {
    return notesTableHasSubjectIdColumn;
  }

  const { error } = await supabase.from(tableName).select("subject_id").limit(1);
  if (!error) {
    notesTableHasSubjectIdColumn = true;
    return true;
  }

  if (error.code === "PGRST204" || error.code === "42703") {
    notesTableHasSubjectIdColumn = false;
    return false;
  }

  throw error;
}

export const NoteService = {
  getAuthenticatedUserId: requireAuthenticatedUserId,

  stripHtml: (value: string): string =>
    value
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),

  getNowLabel: (): string => {
    const now = new Date();
    return now.toLocaleDateString('en-GB');
  },

  filterNotes: (notes: Note[], query: string): Note[] => {
    if (!query) return notes;
    const lowerQuery = query.toLowerCase();
    return notes.filter(note => {
      const subjectMatch = note.subject.toLowerCase().includes(lowerQuery);
      const descriptionMatch = NoteService.stripHtml(note.description).toLowerCase().includes(lowerQuery);
      return subjectMatch || descriptionMatch;
    });
  },

  togglePin: (notes: Note[], id: string): Note[] => {
    const noteIndex = notes.findIndex(n => n.id === id);
    if (noteIndex === -1) return notes;

    const note = notes[noteIndex];
    const isNowPinned = !note.isPinned;
    const updatedNote = { ...note, isPinned: isNowPinned, date: NoteService.getNowLabel() };

    const newNotes = [...notes];
    newNotes.splice(noteIndex, 1);

    let insertIndex = 0;
    while (insertIndex < newNotes.length && newNotes[insertIndex].isPinned) {
      insertIndex++;
    }

    newNotes.splice(insertIndex, 0, updatedNote);
    return newNotes;
  },

  deleteNote: (notes: Note[], id: string): Note[] => notes.filter(note => note.id !== id),

  updateNote: (
    notes: Note[],
    id: string,
    data: Partial<Pick<Note, 'subject' | 'description' | 'isPinned' | 'accentColor' | 'textColor'>>,
  ): Note[] =>
    notes.map(note =>
      note.id === id
        ? {
            ...note,
            subject: data.subject ?? note.subject,
            description: data.description ?? note.description,
            isPinned: data.isPinned ?? note.isPinned,
            accentColor: data.accentColor ?? note.accentColor,
            textColor: data.textColor ?? note.textColor,
            date: NoteService.getNowLabel(),
          }
        : note,
    ),

  // Notes page fetch: user-specific only
  fetchNotesFromDb: async (): Promise<Note[]> => {
    const userId = await requireAuthenticatedUserId();
    const tableName = await resolveNotesTableName();
    const { data, error } = await supabase
      .from(tableName)
      .select('id, question_id, title, content, pinned, created_at')
      .eq('user_id', userId)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return ((data ?? []) as NoteRow[]).map(mapRowToNote);
  },

  addNoteToDb: async (
    data: Partial<Pick<Note, 'subject' | 'description' | 'isPinned' | 'questionId'>>,
  ): Promise<string> => {
    const userId = await requireAuthenticatedUserId();
    const tableName = await resolveNotesTableName();
    const { data: insertedData, error } = await supabase
      .from(tableName)
      .insert([
        {
          user_id: userId,
          question_id: data.questionId ?? null,
          title: data.subject || 'NEW NOTE',
          content: data.description || '<p></p>',
          pinned: data.isPinned || false,
        },
      ])
      .select('id')
      .single();

    if (error) throw error;
    return String(insertedData.id ?? Date.now());
  },

  updateNoteInDb: async (id: string, data: Partial<Pick<Note, 'subject' | 'description' | 'isPinned'>>) => {
    const userId = await requireAuthenticatedUserId();
    const tableName = await resolveNotesTableName();
    const updates: NoteDbUpdate = {};
    if (data.subject !== undefined) updates.title = data.subject;
    if (data.description !== undefined) updates.content = data.description;
    if (data.isPinned !== undefined) updates.pinned = data.isPinned;

    if (Object.keys(updates).length === 0) return;

    const { data: updatedRow, error } = await supabase
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!updatedRow) {
      throw new Error('Note not found or access denied.');
    }
  },

  deleteNoteFromDb: async (id: string) => {
    const userId = await requireAuthenticatedUserId();
    const tableName = await resolveNotesTableName();
    const { data: deletedRow, error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!deletedRow) {
      throw new Error('Note not found or access denied.');
    }
  },

  fetchNoteByQuestionId: async (questionId: string): Promise<QuestionNoteRecord | null> => {
    const userId = await requireAuthenticatedUserId();
    const tableName = await resolveNotesTableName();
    const hasSubjectIdColumn = await resolveSubjectIdColumnAvailability(tableName);
    const { data, error } = await supabase
      .from(tableName)
      .select(getQuestionNoteSelectClause(hasSubjectIdColumn))
      .eq('user_id', userId)
      .eq('question_id', questionId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    const row = ((data ?? []) as unknown as NoteRow[])[0];
    if (!row) return null;
    return mapRowToQuestionNote(row);
  },

  fetchNoteByQuestionAndSubject: async (
    questionId: string,
    subjectId: string | null,
  ): Promise<QuestionNoteRecord | null> => {
    if (!subjectId) {
      return NoteService.fetchNoteByQuestionId(questionId);
    }

    const userId = await requireAuthenticatedUserId();
    const tableName = await resolveNotesTableName();
    const hasSubjectIdColumn = await resolveSubjectIdColumnAvailability(tableName);

    let query = supabase
      .from(tableName)
      .select(getQuestionNoteSelectClause(hasSubjectIdColumn))
      .eq("user_id", userId)
      .eq("question_id", questionId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (hasSubjectIdColumn) {
      query = query.eq("subject_id", subjectId);
    }

    const { data, error } = await query;

    if (error) throw error;
    const row = ((data ?? []) as unknown as NoteRow[])[0];
    if (!row) return null;
    return mapRowToQuestionNote(row);
  },

  upsertQuestionNote: async (payload: QuestionNotePayload): Promise<QuestionNoteRecord> => {
    const userId = await requireAuthenticatedUserId();
    const tableName = await resolveNotesTableName();
    const hasSubjectIdColumn = await resolveSubjectIdColumnAvailability(tableName);

    const existing = await NoteService.fetchNoteByQuestionAndSubject(payload.questionId, payload.subjectId);
    if (existing) {
      const updates: { title: string; content: string; pinned: boolean; subject_id?: string | null } = {
        title: payload.title,
        content: payload.content,
        pinned: payload.pinned ?? existing.pinned,
      };
      if (hasSubjectIdColumn) {
        updates.subject_id = payload.subjectId;
      }

      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', existing.id)
        .eq('user_id', userId)
        .select(getQuestionNoteSelectClause(hasSubjectIdColumn))
        .single();

      if (error) throw error;
      return mapRowToQuestionNote(data as unknown as NoteRow);
    }

    const insertPayload: {
      user_id: string;
      question_id: string;
      title: string;
      content: string;
      pinned: boolean;
      subject_id?: string | null;
    } = {
      user_id: userId,
      question_id: payload.questionId,
      title: payload.title,
      content: payload.content,
      pinned: payload.pinned ?? false,
    };

    if (hasSubjectIdColumn) {
      insertPayload.subject_id = payload.subjectId;
    }

    const { data, error } = await supabase
      .from(tableName)
      .insert([insertPayload])
      .select(getQuestionNoteSelectClause(hasSubjectIdColumn))
      .single();

    if (error) throw error;
    return mapRowToQuestionNote(data as unknown as NoteRow);
  },
};
