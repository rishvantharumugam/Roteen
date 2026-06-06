import { VideoBookmarkController } from "@/features/video/actions/videoBookmarkController";
import type { BookmarkQuestionContext, UserPlaylist } from "@/features/video/services/videoBookmarkService";

export async function loadUserBookmarkPlaylists(questionId?: string): Promise<UserPlaylist[]> {
  return VideoBookmarkController.getUserPlaylists(questionId);
}

export async function addQuestionToExistingPlaylist(
  playlistId: string,
  context: BookmarkQuestionContext,
): Promise<void> {
  await VideoBookmarkController.addQuestionToExistingPlaylist(playlistId, context);
}

export async function toggleQuestionInExistingPlaylist(
  playlistId: string,
  context: BookmarkQuestionContext,
): Promise<"added" | "removed"> {
  return VideoBookmarkController.toggleQuestionInExistingPlaylist(playlistId, context);
}

export async function createPlaylistAndAddQuestion(
  playlistName: string,
  context: BookmarkQuestionContext,
): Promise<void> {
  await VideoBookmarkController.createPlaylistAndAddQuestion(playlistName, context);
}

export async function getBookmarkStatus(questionId: string): Promise<boolean> {
  try {
    return await VideoBookmarkController.isQuestionBookmarked(questionId);
  } catch {
    return false;
  }
}
