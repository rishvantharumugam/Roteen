import { supabase } from '@/services/supabaseClient';

export interface SupabaseQuestionPaper {
  id: string;
  subject_id: string;
  chapter_id: string;
  year: string; // "YYYY-MM-DD"
  file_url: string | null;
}

export interface SupabaseSubject {
  id: string;
  standard: string;
  subject_name: string;
}

export interface SupabaseChapter {
  id: string;
  subject_id: string;
  name: string;
  chapter_no: number;
}

export const PYQService = {
  async fetchSubjects(): Promise<SupabaseSubject[]> {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, standard, subject_name');

      if (error) throw error;
      return (data || []) as SupabaseSubject[];
    } catch (error) {
      console.error('Failed to fetch subjects in PYQService:', error);
      return [];
    }
  },

  async fetchChapters(): Promise<SupabaseChapter[]> {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('id, subject_id, name, chapter_no')
        .order('chapter_no', { ascending: true });

      if (error) throw error;
      return (data || []) as SupabaseChapter[];
    } catch (error) {
      console.error('Failed to fetch chapters in PYQService:', error);
      return [];
    }
  },

  async fetchQuestionPapers(): Promise<SupabaseQuestionPaper[]> {
    try {
      const { data, error } = await supabase
        .from('question_paper')
        .select('id, subject_id, chapter_id, year, file_url');

      if (error) throw error;
      return (data || []) as SupabaseQuestionPaper[];
    } catch (error) {
      console.error('Failed to fetch question papers in PYQService:', error);
      return [];
    }
  }
};
