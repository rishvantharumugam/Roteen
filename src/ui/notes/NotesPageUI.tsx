import React from 'react';
import { noteStyles } from '@/styles/notesStyles';
import { Navbar, NoteCard, SearchBar, Note, NewNoteDraft, NewNoteModal, NotePreviewModal } from '@/store/notes/notesStore';
import { Plus } from 'lucide-react';
import { Toaster } from 'sonner';

interface NotesPageUIProps {
  notes: Note[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onViewNote: (id: string) => void;
  isEditorOpen: boolean;
  draft: NewNoteDraft;
  isTitleLocked: boolean;
  onOpenEditor: () => void;
  onCloseEditor: () => void;
  onDraftChange: (updates: Partial<NewNoteDraft>) => void;
  onSaveDraft: () => void;
  isPreviewOpen: boolean;
  previewNote: Note | null;
  onClosePreview: () => void;
}

export const NotesPageUI: React.FC<NotesPageUIProps> = ({
  notes,
  searchQuery,
  onSearchChange,
  onTogglePin,
  onDelete,
  onEdit,
  onViewNote,
  isEditorOpen,
  draft,
  isTitleLocked,
  onOpenEditor,
  onCloseEditor,
  onDraftChange,
  onSaveDraft,
  isPreviewOpen,
  previewNote,
  onClosePreview,
}) => {
  return (
    <div className={noteStyles.background}>
      <Toaster theme="dark" position="bottom-right" />
      <Navbar />
      <main className={noteStyles.mainContent}>
        <div className={noteStyles.headerSection}>
          <h1 className={noteStyles.pageTitle}>NOTES</h1>
          <SearchBar value={searchQuery} onChange={onSearchChange} />
        </div>
        <div className={noteStyles.grid}>
          {notes.map(note => (
            <NoteCard 
              key={note.id} 
              note={note} 
              onTogglePin={onTogglePin} 
              onDelete={onDelete} 
              onEdit={onEdit}
              onView={onViewNote}
            />
          ))}
        </div>
      </main>
      <div className={noteStyles.fab} onClick={onOpenEditor}>
        <Plus size={28} />
      </div>

      <NewNoteModal
        isOpen={isEditorOpen}
        draft={draft}
        isTitleLocked={isTitleLocked}
        onClose={onCloseEditor}
        onDraftChange={onDraftChange}
        onSave={onSaveDraft}
      />
      <NotePreviewModal
        isOpen={isPreviewOpen}
        note={previewNote}
        onClose={onClosePreview}
        onEdit={onEdit}
      />
    </div>
  );
};




