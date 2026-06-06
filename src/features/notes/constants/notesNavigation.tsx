'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { NoteController } from '@/features/notes/actions/notesController';
import { NoteService } from '@/features/notes/services/notesService';
import { NotesPageUI } from '@/features/notes/components/NotesPageUI';
import { Note, NewNoteDraft } from '@/features/notes/components/notesStore';

const DRAFT_STORAGE_KEY = 'note-editor-draft-v1';

const initialDraft: NewNoteDraft = {
  subject: '',
  description: '<p></p>',
  isPinned: false,
  accentColor: '#F59E0B',
  textColor: '#C7D2FE',
};

export const NotesNavigation = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isTitleLocked, setIsTitleLocked] = useState(false);
  const [draft, setDraft] = useState<NewNoteDraft>(initialDraft);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewNoteId, setPreviewNoteId] = useState<string | null>(null);

  const notesQuery = useQuery({
    queryKey: queryKeys.notes,
    queryFn: () => NoteController.fetchNotes(),
    staleTime: 60_000,
    gcTime: 15 * 60_000,
  });

  useEffect(() => {
    if (!notesQuery.error) {
      return;
    }
    toast.error('Failed to load notes');
  }, [notesQuery.error]);

  useEffect(() => {
    const notesChannel = supabase
      .channel('notes-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.notes });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_notes' }, () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.notes });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(notesChannel);
    };
  }, [queryClient]);

  const resetEditorState = () => {
    setIsEditorOpen(false);
    setMode('create');
    setEditingNoteId(null);
    setIsTitleLocked(false);
    setDraft(initialDraft);
  };

  const notes = useMemo(() => notesQuery.data ?? [], [notesQuery.data]);

  const updateNotesCache = (updater: (current: Note[]) => Note[]) => {
    queryClient.setQueryData<Note[]>(queryKeys.notes, (current) => updater(current ?? []));
  };

  const createNoteMutation = useMutation({
    mutationFn: async (payload: {
      tempId: string;
      subject: string;
      description: string;
      isPinned: boolean;
      accentColor: string;
      textColor: string;
    }) => {
      const id = await NoteController.createNote({
        subject: payload.subject,
        description: payload.description,
        isPinned: payload.isPinned,
      });
      return { id, tempId: payload.tempId };
    },
    onError: (_error, variables) => {
      updateNotesCache((current) => current.filter((note) => note.id !== variables.tempId));
      toast.error('Failed to save note');
    },
    onSuccess: ({ id, tempId }) => {
      updateNotesCache((current) =>
        current.map((note) => (note.id === tempId ? { ...note, id } : note)),
      );
      toast.success('Note created successfully');
      resetEditorState();
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async (payload: {
      id: string;
      subject: string;
      description: string;
      isPinned: boolean;
    }) => {
      await NoteController.editNote(payload.id, {
        subject: payload.subject,
        description: payload.description,
        isPinned: payload.isPinned,
      });
      return payload;
    },
    onError: () => {
      toast.error('Failed to save note');
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes });
    },
    onSuccess: () => {
      toast.success('Note updated successfully');
      resetEditorState();
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: async (payload: { id: string; nextPinnedState: boolean }) => {
      await NoteController.editNote(payload.id, { isPinned: payload.nextPinnedState });
      return payload;
    },
    onError: () => {
      toast.error('Failed to pin note');
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await NoteController.removeNote(id);
      return id;
    },
    onError: () => {
      toast.error('Failed to delete note');
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes });
    },
    onSuccess: () => {
      toast.success('Note deleted successfully');
    },
  });

  useEffect(() => {
    if (!isEditorOpen || mode !== 'create') return;
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }, [draft, isEditorOpen, mode]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleTogglePin = async (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    updateNotesCache((current) => NoteService.togglePin(current, id));
    await togglePinMutation.mutateAsync({ id, nextPinnedState: !note.isPinned });
  };

  const handleDelete = async (id: string) => {
    updateNotesCache((current) => NoteService.deleteNote(current, id));
    if (previewNoteId === id) {
      setIsPreviewOpen(false);
      setPreviewNoteId(null);
    }
    await deleteMutation.mutateAsync(id);
  };

  const handleOpenEditor = () => {
    setMode('create');
    setEditingNoteId(null);
    setIsTitleLocked(false);
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft) as NewNoteDraft;
        setDraft({ ...initialDraft, ...parsed });
      } catch {
        setDraft(initialDraft);
      }
    } else {
      setDraft(initialDraft);
    }
    setIsEditorOpen(true);
  };

  const handleEditNote = (id: string) => {
    const note = notes.find((item) => item.id === id);
    if (!note) return;
    setMode('edit');
    setEditingNoteId(id);
    setIsTitleLocked(Boolean(note.questionId));
    setDraft({
      subject: note.subject,
      description: note.description,
      isPinned: note.isPinned,
      accentColor: note.accentColor || '#F59E0B',
      textColor: note.textColor || '#C7D2FE',
    });
    setIsEditorOpen(true);
  };

  const handleViewNote = (id: string) => {
    setPreviewNoteId(id);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewNoteId(null);
  };

  const handleDraftChange = (updates: Partial<NewNoteDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  };

  const handleSaveDraft = async () => {
    const editingNote = mode === 'edit' && editingNoteId
      ? notes.find((item) => item.id === editingNoteId)
      : null;
    const subject = isTitleLocked && editingNote
      ? editingNote.subject
      : (draft.subject.trim() || 'NEW NOTE');
    const description =
      NoteService.stripHtml(draft.description).trim().length > 0
        ? draft.description
        : '<p>Start writing your new note here...</p>';

    if (mode === 'edit' && editingNoteId) {
      updateNotesCache((current) => NoteService.updateNote(current, editingNoteId, {
        subject,
        description,
        isPinned: draft.isPinned,
        accentColor: draft.accentColor,
        textColor: draft.textColor,
      }));
      await updateNoteMutation.mutateAsync({
        id: editingNoteId,
        subject,
        description,
        isPinned: draft.isPinned,
      });
      return;
    }

    const tempId = `temp-note-${Date.now()}`;
    const optimisticNote: Note = {
      id: tempId,
      subject,
      description,
      date: NoteService.getNowLabel(),
      isPinned: draft.isPinned,
      accentColor: draft.accentColor,
      textColor: draft.textColor,
      questionId: null,
    };

    updateNotesCache((current) => [optimisticNote, ...current]);
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    await createNoteMutation.mutateAsync({
      tempId,
      subject,
      description,
      isPinned: draft.isPinned,
      accentColor: draft.accentColor,
      textColor: draft.textColor,
    });
  };

  const handleCloseEditor = () => {
    const tryAutoSave = async () => {
      const subjectInput = draft.subject.trim();
      const descriptionInput = NoteService.stripHtml(draft.description).trim();
      const hasContent = subjectInput.length > 0 || descriptionInput.length > 0;

      if (mode === 'create') {
        if (hasContent) {
          await handleSaveDraft();
          return;
        }
        resetEditorState();
        return;
      }

      const editingNote = editingNoteId ? notes.find((item) => item.id === editingNoteId) : null;
      if (!editingNote) {
        resetEditorState();
        return;
      }

      const hasChanged =
        draft.subject !== editingNote.subject ||
        draft.description !== editingNote.description ||
        draft.isPinned !== editingNote.isPinned ||
        draft.accentColor !== editingNote.accentColor ||
        draft.textColor !== editingNote.textColor;

      if (hasChanged) {
        await handleSaveDraft();
        return;
      }

      resetEditorState();
    };

    void tryAutoSave();
  };

  const displayedNotes = useMemo(
    () => NoteService.filterNotes(notes, searchQuery),
    [notes, searchQuery],
  );
  const previewNote = previewNoteId ? notes.find((item) => item.id === previewNoteId) ?? null : null;

  return (
    <NotesPageUI
      notes={notesQuery.isLoading ? [] : displayedNotes}
      isLoading={notesQuery.isLoading}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      onTogglePin={handleTogglePin}
      onDelete={handleDelete}
      onEdit={handleEditNote}
      onViewNote={handleViewNote}
      isEditorOpen={isEditorOpen}
      draft={draft}
      isTitleLocked={isTitleLocked}
      onOpenEditor={handleOpenEditor}
      onCloseEditor={handleCloseEditor}
      onDraftChange={handleDraftChange}
      onSaveDraft={handleSaveDraft}
      isPreviewOpen={isPreviewOpen}
      previewNote={previewNote}
      onClosePreview={handleClosePreview}
    />
  );
};
