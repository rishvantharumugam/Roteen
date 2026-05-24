import React from 'react';
import { RevisionHeader } from '@/store/revision/RevisionHeader';
import { RevisionSearch } from '@/store/revision/RevisionSearch';
import { PlaylistGrid } from '@/store/revision/PlaylistGrid';
import { AddPlaylistButton } from '@/store/revision/AddPlaylistButton';
import { NewPlaylistModal } from '@/store/revision/NewPlaylistModal';
import { Playlist, NewPlaylistDraft } from '@/store/revision/revisionTypes';
import { revisionStyles } from '@/styles/revisionStyles';

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
  onSaveModal
}) => {
  return (
    <div className={revisionStyles.background}>
      <RevisionHeader />
      
      <main className={revisionStyles.mainContent}>
        <div className={revisionStyles.headerSection}>
          <div className={revisionStyles.headerTextGroup}>
            <h1 className={revisionStyles.pageTitle}>REVISION</h1>
            <p className={revisionStyles.pageSubtitle}>Organize your playlists and revise smarter.</p>
          </div>
          
          <RevisionSearch 
            value={searchQuery} 
            onChange={onSearchChange} 
          />
        </div>
        
        <PlaylistGrid 
          playlists={playlists} 
          onOpen={onOpenPlaylist}
          onDelete={onDeletePlaylist}
          onTogglePin={onTogglePin}
        />
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







