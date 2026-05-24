import { Note } from '@/store/notes/notesStore';
import { NoteService, QuestionNotePayload, QuestionNoteRecord } from '@/service/notesService';

let cachedNotes: Note[] | null = null;
let cachedUserId: string | null = null;
let fetchPromise: Promise<Note[]> | null = null;

export const NoteController = {
  fetchNotes: async (): Promise<Note[]> => {
    const currentUserId = await NoteService.getAuthenticatedUserId();

    if (cachedUserId !== currentUserId) {
      cachedNotes = null;
      fetchPromise = null;
      cachedUserId = currentUserId;
    }

    if (cachedNotes) {
      // Return instantly from cache, but fetch silently in background to keep synced
      NoteService.fetchNotesFromDb()
        .then(notes => {
          cachedNotes = notes;
          cachedUserId = currentUserId;
        })
        .catch(console.error);
      return cachedNotes;
    }
    
    if (fetchPromise) return fetchPromise;
    
    fetchPromise = NoteService.fetchNotesFromDb().then(notes => {
      cachedNotes = notes;
      cachedUserId = currentUserId;
      fetchPromise = null;
      return notes;
    }).catch(error => {
      fetchPromise = null;
      throw error;
    });
    
    return fetchPromise;
  },

  createNote: async (data: Partial<Pick<Note, 'subject' | 'description' | 'isPinned' | 'questionId'>>): Promise<string> => {
    try {
      const id = await NoteService.addNoteToDb(data);
      if (cachedNotes) {
        const newNote: Note = {
          id,
          questionId: data.questionId ?? null,
          subject: data.subject || 'NEW NOTE',
          description: data.description || '<p></p>',
          isPinned: data.isPinned || false,
          date: NoteService.getNowLabel(),
          accentColor: '#F59E0B',
          textColor: '#C7D2FE',
        };
        cachedNotes = [newNote, ...cachedNotes];
      }
      return id;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  },

  editNote: async (id: string, data: Partial<Pick<Note, 'subject' | 'description' | 'isPinned'>>): Promise<void> => {
    try {
      await NoteService.updateNoteInDb(id, data);
      if (cachedNotes) {
        cachedNotes = cachedNotes.map(n => 
          n.id === id ? { ...n, ...data } : n
        );
      }
    } catch (error) {
      console.error('Error editing note:', error);
      throw error;
    }
  },

  removeNote: async (id: string): Promise<void> => {
    try {
      await NoteService.deleteNoteFromDb(id);
      if (cachedNotes) {
        cachedNotes = cachedNotes.filter(n => n.id !== id);
      }
    } catch (error) {
      console.error('Error removing note:', error);
      throw error;
    }
  },

  updateNotes: async (newNotes: Note[]): Promise<void> => {
    console.warn('updateNotes called, this is a no-op with Supabase backend');
  },

  fetchQuestionNote: async (
    questionId: string,
    subjectId: string | null = null,
  ): Promise<QuestionNoteRecord | null> => {
    return NoteService.fetchNoteByQuestionAndSubject(questionId, subjectId);
  },

  upsertQuestionNote: async (payload: QuestionNotePayload): Promise<QuestionNoteRecord> => {
    return NoteService.upsertQuestionNote(payload);
  },
};


