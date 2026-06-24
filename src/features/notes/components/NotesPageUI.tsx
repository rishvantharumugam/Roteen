import React from 'react';
import { Navbar, NoteCard, SearchBar, Note, NewNoteDraft, NewNoteModal, NotePreviewModal } from '@/features/notes/components/notesStore';
import { NoteService } from '@/features/notes/services/notesService';
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
  isLoading?: boolean;
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
  isLoading,
}) => {
  return (
    <div className={`bg-black text-zinc-200 min-h-screen text-white font-sans overflow-x-hidden`}>
      <Toaster theme="dark" position="bottom-right" />
      <Navbar />
      <main className="px-8 md:px-12 py-12 max-w-[1660px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-[40px] font-black tracking-tight">NOTES</h1>
            <p className="text-gray-400 text-sm font-medium">Capture your thoughts and organize your brilliant ideas.</p>
          </div>
          <SearchBar value={searchQuery} onChange={onSearchChange} />
        </div>
        {isLoading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,240px))] gap-5 justify-start">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[280px] w-full max-w-[240px] flex flex-col p-5 rounded-[24px] bg-[#151515] border border-[rgba(255,255,255,0.03)]">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-6 w-3/4 rounded bg-[#1D1D1D] skeleton-shimmer" />
                  <div className="h-6 w-6 rounded-md bg-[#1D1D1D] skeleton-shimmer" />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 w-full rounded bg-[#1D1D1D] skeleton-shimmer" />
                  <div className="h-4 w-full rounded bg-[#1D1D1D] skeleton-shimmer" />
                  <div className="h-4 w-2/3 rounded bg-[#1D1D1D] skeleton-shimmer" />
                </div>
                <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.04)] flex justify-between items-center">
                  <div className="h-3 w-16 rounded bg-[#1D1D1D] skeleton-shimmer" />
                  <div className="h-6 w-6 rounded-md bg-[#1D1D1D] skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,240px))] gap-5 justify-start">
            {(() => {
              const validNotes = notes.filter(note => {
                const stripped = NoteService.stripHtml(note.description || "");
                return stripped && stripped.trim().length > 0;
              });

              if (validNotes.length === 0) {
                return (
                  <div 
                    className="w-full max-w-[240px] min-h-[220px] bg-[#121212] rounded-[18px] p-4 relative border border-zinc-800 flex flex-col h-full opacity-60 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={onOpenEditor}
                  >
                    <div className="flex items-start mb-4 gap-3">
                      <div className="flex items-center gap-2.5 flex-1 pt-0.5">
                        <div className="h-[7px] w-[7px] shrink-0 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                        <h3 className="text-[12px] font-bold tracking-[0.25em] text-gray-100 uppercase break-words">Sample Note</h3>
                      </div>
                    </div>
                    <p className="text-[14px] text-[#94A3B8] leading-relaxed min-h-[96px] font-medium flex-1">Save Notes for Future Learning .</p>
                    <div className="text-[11px] font-bold text-gray-400 mt-4 tracking-widest mt-auto">TODAY</div>
                  </div>
                );
              }

              return validNotes.map(note => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  onTogglePin={onTogglePin} 
                  onDelete={onDelete} 
                  onEdit={onEdit}
                  onView={onViewNote}
                />
              ));
            })()}
          </div>
        )}
      </main>
      <div className="fixed bottom-10 right-10 w-[56px] h-[56px] rounded-full border-[1.5px] border-white flex items-center justify-center text-white hover:bg-white/10 transition-all cursor-pointer z-50" onClick={onOpenEditor}>
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




