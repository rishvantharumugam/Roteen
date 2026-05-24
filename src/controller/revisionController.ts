import { Playlist, NewPlaylistDraft } from '@/store/revision/revisionTypes';
import { RevisionService, type PlaylistLaunchContext } from '@/service/revisionService';

let cachedPlaylists: Playlist[] | null = null;
let cachedUserId: string | null = null;
let fetchPromise: Promise<Playlist[]> | null = null;

export const RevisionController = {
  getPlaylists: async (): Promise<Playlist[]> => {
    const currentUserId = await RevisionService.getAuthenticatedUserId();

    if (cachedUserId !== currentUserId) {
      cachedPlaylists = null;
      fetchPromise = null;
      cachedUserId = currentUserId;
    }

    if (cachedPlaylists) {
      RevisionService.fetchPlaylistsFromDb()
        .then(playlists => {
          cachedPlaylists = playlists;
          cachedUserId = currentUserId;
        })
        .catch(console.error);
      return cachedPlaylists;
    }

    if (fetchPromise) return fetchPromise;

    fetchPromise = RevisionService.fetchPlaylistsFromDb().then(playlists => {
      cachedPlaylists = playlists;
      cachedUserId = currentUserId;
      fetchPromise = null;
      return playlists;
    }).catch(error => {
      fetchPromise = null;
      throw error;
    });

    return fetchPromise;
  },

  createPlaylist: async (draft: NewPlaylistDraft): Promise<Playlist> => {
    try {
      const id = await RevisionService.addPlaylistToDb(draft);
      const newPlaylist: Playlist = {
        id,
        title: draft.title || 'New Playlist',
        videoCount: 0,
        isPinned: false,
        date: new Date().toLocaleDateString('en-GB', {
          day: '2-digit', month: '2-digit', year: 'numeric'
        })
      };

      if (cachedPlaylists) {
        cachedPlaylists = [newPlaylist, ...cachedPlaylists];
      }
      return newPlaylist;
    } catch (error) {
      console.error('Failed to create playlist', error);
      throw error;
    }
  },

  removePlaylist: async (id: string): Promise<void> => {
    try {
      await RevisionService.deletePlaylistFromDb(id);
      if (cachedPlaylists) {
        cachedPlaylists = cachedPlaylists.filter(p => p.id !== id);
      }
    } catch (error) {
      console.error('Failed to delete playlist', error);
      throw error;
    }
  },

  togglePinPlaylist: async (id: string, isPinned: boolean): Promise<void> => {
    try {
      await RevisionService.updatePlaylistInDb(id, { pinned: isPinned });
      if (cachedPlaylists) {
        cachedPlaylists = cachedPlaylists.map(p => 
          p.id === id ? { ...p, isPinned } : p
        );
      }
    } catch (error) {
      console.error('Failed to toggle pin for playlist', error);
      throw error;
    }
  },

  getPlaylistLaunchContext: async (playlistId: string): Promise<PlaylistLaunchContext> => {
    return RevisionService.fetchPlaylistLaunchContext(playlistId);
  },
};


