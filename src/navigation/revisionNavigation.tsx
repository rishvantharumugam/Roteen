'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { RevisionPage } from '@/ui/revision/RevisionPageUI';
import { RevisionController } from '@/controller/revisionController';
import { RevisionService } from '@/service/revisionService';
import { Playlist, NewPlaylistDraft } from '@/store/revision/revisionTypes';
import { navigateToVideoPlaylist } from '@/navigation/videoSubjectNavigation';
import { setVideoPlaylistContext } from '@/store/video/videoPlaylistStore';
import { queryKeys } from '@/lib/queryKeys';
import { supabase } from '@/lib/supabase';

const initialDraft: NewPlaylistDraft = {
  title: '',
};

export const RevisionNavigation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState<NewPlaylistDraft>(initialDraft);

  const playlistsQuery = useQuery({
    queryKey: queryKeys.revisionPlaylists,
    queryFn: () => RevisionController.getPlaylists(),
    staleTime: 60_000,
    gcTime: 15 * 60_000,
  });

  const playlists = useMemo(() => playlistsQuery.data ?? [], [playlistsQuery.data]);

  useEffect(() => {
    if (!playlistsQuery.error) {
      return;
    }
    toast.error('Failed to load playlists');
  }, [playlistsQuery.error]);

  useEffect(() => {
    const revisionChannel = supabase
      .channel('revision-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quickrevision_lists' }, () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.revisionPlaylists });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quickrevision_lists_Items' }, () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.revisionPlaylists });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(revisionChannel);
    };
  }, [queryClient]);

  const updatePlaylistsCache = (updater: (current: Playlist[]) => Playlist[]) => {
    queryClient.setQueryData<Playlist[]>(queryKeys.revisionPlaylists, (current) => updater(current ?? []));
  };

  const createPlaylistMutation = useMutation({
    mutationFn: async (payload: { tempId: string; title: string }) => {
      const created = await RevisionController.createPlaylist({ title: payload.title });
      return { created, tempId: payload.tempId };
    },
    onError: (_error, variables) => {
      updatePlaylistsCache((current) => current.filter((item) => item.id !== variables.tempId));
      toast.error('Something went wrong creating playlist');
    },
    onSuccess: ({ created, tempId }) => {
      updatePlaylistsCache((current) =>
        current.map((item) => (item.id === tempId ? created : item)),
      );
      toast.success('Playlist created successfully');
      setIsModalOpen(false);
      setDraft(initialDraft);
    },
  });

  const deletePlaylistMutation = useMutation({
    mutationFn: async (id: string) => {
      await RevisionController.removePlaylist(id);
      return id;
    },
    onError: () => {
      toast.error('Something went wrong deleting playlist');
      void queryClient.invalidateQueries({ queryKey: queryKeys.revisionPlaylists });
    },
    onSuccess: () => {
      toast.success('Playlist deleted');
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: async (payload: { id: string; newStatus: boolean }) => {
      await RevisionController.togglePinPlaylist(payload.id, payload.newStatus);
      return payload;
    },
    onError: () => {
      toast.error('Something went wrong pinning playlist');
      void queryClient.invalidateQueries({ queryKey: queryKeys.revisionPlaylists });
    },
  });

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleAddPlaylist = () => {
    setDraft(initialDraft);
    setIsModalOpen(true);
  };

  const handleSaveDraft = async () => {
    const title = draft.title.trim() || 'New Playlist';
    const tempId = `temp-playlist-${Date.now()}`;
    const optimisticPlaylist: Playlist = {
      id: tempId,
      title,
      videoCount: 0,
      isPinned: false,
      date: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    };

    updatePlaylistsCache((current) => [optimisticPlaylist, ...current]);
    await createPlaylistMutation.mutateAsync({ tempId, title });
  };

  const handleCloseModal = () => {
    const hasContent = draft.title.trim().length > 0;
    if (hasContent) {
      void handleSaveDraft();
      return;
    }
    setIsModalOpen(false);
    setDraft(initialDraft);
  };

  const handleDraftChange = (updates: Partial<NewPlaylistDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  };

  const handleDeletePlaylist = async (id: string) => {
    updatePlaylistsCache((current) => current.filter((item) => item.id !== id));
    await deletePlaylistMutation.mutateAsync(id);
  };

  const handleTogglePin = async (id: string) => {
    const playlist = playlists.find((item) => item.id === id);
    if (!playlist) return;

    const newStatus = !playlist.isPinned;
    updatePlaylistsCache((current) => RevisionService.togglePin(current, id));
    await togglePinMutation.mutateAsync({ id, newStatus });
    toast.success(newStatus ? 'Playlist pinned' : 'Playlist unpinned');
  };

  const handleOpenPlaylist = async (playlistId: string) => {
    try {
      const context = await RevisionController.getPlaylistLaunchContext(playlistId);
      if (!context.questionIds.length) {
        toast.error("This playlist has no questions yet.");
        return;
      }
      if (!context.subjectId) {
        toast.error("Could not resolve subject for this playlist.");
        return;
      }

      setVideoPlaylistContext(context);
      navigateToVideoPlaylist(router, {
        playlistId: context.playlistId,
        subjectId: context.subjectId,
        subjectTitle: context.subjectTitle ?? "Subject",
        subjectStandard: context.subjectStandard,
      });
    } catch (error) {
      toast.error("Failed to open playlist");
      console.error("Failed to open playlist", error);
    }
  };

  const displayedPlaylists = useMemo(
    () => RevisionService.filterPlaylists(playlists, searchQuery),
    [playlists, searchQuery],
  );

  const pageProps = {
    playlists: displayedPlaylists,
    searchQuery,
    onSearchChange: handleSearchChange,
    onAddPlaylist: handleAddPlaylist,
    onOpenPlaylist: handleOpenPlaylist,
    onDeletePlaylist: handleDeletePlaylist,
    onTogglePin: handleTogglePin,
    isModalOpen,
    draft,
    onCloseModal: handleCloseModal,
    onDraftChange: handleDraftChange,
    onSaveModal: handleSaveDraft,
  };

  return (
    <>
      <Toaster theme="dark" position="bottom-right" />
      <RevisionPage {...pageProps} playlists={playlistsQuery.isLoading ? [] : displayedPlaylists} />
    </>
  );
};
