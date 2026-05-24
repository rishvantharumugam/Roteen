import {
  VideoBookmarkService,
  type BookmarkQuestionContext,
  type UserPlaylist,
} from "@/service/videoBookmarkService";

export const VideoBookmarkController = {
  getUserPlaylists: async (questionId?: string): Promise<UserPlaylist[]> => {
    return VideoBookmarkService.fetchUserPlaylistsFromDb(questionId);
  },

  createPlaylistAndAddQuestion: async (
    playlistName: string,
    context: BookmarkQuestionContext,
  ): Promise<void> => {
    const playlistId = await VideoBookmarkService.createPlaylistForUserInDb(playlistName);
    await VideoBookmarkService.addQuestionToPlaylistInDb(playlistId, context);
  },

  addQuestionToExistingPlaylist: async (
    playlistId: string,
    context: BookmarkQuestionContext,
  ): Promise<void> => {
    await VideoBookmarkService.addQuestionToPlaylistInDb(playlistId, context);
  },

  toggleQuestionInExistingPlaylist: async (
    playlistId: string,
    context: BookmarkQuestionContext,
  ): Promise<"added" | "removed"> => {
    return VideoBookmarkService.toggleQuestionInPlaylistInDb(playlistId, context);
  },

  isQuestionBookmarked: async (questionId: string): Promise<boolean> => {
    return VideoBookmarkService.isQuestionBookmarkedInDb(questionId);
  },
};
