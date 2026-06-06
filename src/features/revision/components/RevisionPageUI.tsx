import React from 'react';
import { RevisionHeader } from '@/features/revision/components/RevisionHeader';
import { RevisionSearch } from '@/features/revision/components/RevisionSearch';
import { PlaylistGrid } from '@/features/revision/components/PlaylistGrid';
import { AddPlaylistButton } from '@/features/revision/components/AddPlaylistButton';
import { NewPlaylistModal } from '@/features/revision/components/NewPlaylistModal';
import { Playlist, NewPlaylistDraft } from '@/features/revision/components/revisionTypes';

interface RevisionPageProps {
  playlists: Playlist[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddPlaylist: () => void;
  onOpenPlaylist: (id: string) => void;
  onDeletePlaylist: (id: string) => void;
  onTogglePin: (id: string) => void;
  isModalOpen: boolean;
  draft: NewPlaylistDraft;
  onCloseModal: () => void;
  onDraftChange: (updates: Partial<NewPlaylistDraft>) => void;
  onSaveModal: () => void;
  isLoading?: boolean;
}

export const RevisionPage: React.FC<RevisionPageProps> = ({
  playlists,
  searchQuery,
  onSearchChange,
  onAddPlaylist,
  onOpenPlaylist,
  onDeletePlaylist,
  onTogglePin,
  isModalOpen,
  draft,
  onCloseModal,
  onDraftChange,
  onSaveModal,
  isLoading
}) => {
  return (
    <div className={`bg-black text-zinc-200 min-h-screen text-white font-sans overflow-x-hidden`}>
      <RevisionHeader />
      
      <main className="px-8 md:px-16 py-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-[40px] font-black tracking-tight">REVISION</h1>
            <p className="text-gray-400 text-sm font-medium">Organize your playlists and revise smarter.</p>
          </div>
          
          <RevisionSearch 
            value={searchQuery} 
            onChange={onSearchChange} 
          />
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
          <PlaylistGrid 
            playlists={playlists} 
            onOpen={onOpenPlaylist}
            onDelete={onDeletePlaylist}
            onTogglePin={onTogglePin}
          />
        )}
      </main>
      
      <AddPlaylistButton onClick={onAddPlaylist} />

      <NewPlaylistModal
        isOpen={isModalOpen}
        draft={draft}
        onClose={onCloseModal}
        onDraftChange={onDraftChange}
        onSave={onSaveModal}
      />
    </div>
  );
};







