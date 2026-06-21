import { supabase } from '@/services/supabaseClient';

export interface SupabasePYQ {
  id: string | number;
  standard: string | number;
  subject_id: string | number;
  year: string | number;
  category: string;
  image_url: string | null;
}

export interface SupabaseSubject {
  id: string | number;
  standard: string | number;
  subject_name: string;
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

  async fetchPYQs(): Promise<SupabasePYQ[]> {
    try {
      const { data, error } = await supabase
        .from('previous_year_questions')
        .select('id, standard, subject_id, year, category, image_url');

      if (error) throw error;
      return (data || []) as SupabasePYQ[];
    } catch (error) {
      console.error('Failed to fetch PYQs in PYQService:', error);
      return [];
    }
  },

  /** Returns distinct years from the previous_year_questions table, sorted descending (newest first).
   *  If `standard` is provided, only rows matching that standard are considered.
   *  NOTE: the `standard` column is int4 in Supabase — ilike / text operators must NOT be used. */
  async fetchDistinctYears(standard?: string): Promise<string[]> {
    try {
      let query = supabase
        .from('previous_year_questions')
        .select('year');

      if (standard) {
        // Extract the numeric portion of the standard (e.g. "Class 10" → 10, "10th" → 10)
        const numeric = parseInt(standard.replace(/\D/g, ''), 10);
        if (!isNaN(numeric)) {
          // standard is an int4 column — use .eq() with a number, never ilike
          query = query.eq('standard', numeric);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      // Deduplicate and sort descending (newest first)
      const years = [...new Set((data || []).map((row: any) => String(row.year)))];
      years.sort((a, b) => Number(b) - Number(a));
      return years;
    } catch (error) {
      console.error('Failed to fetch distinct years in PYQService:', error);
      return [];
    }
  }
};

