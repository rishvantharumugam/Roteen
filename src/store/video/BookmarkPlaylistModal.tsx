"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, X, Plus, Folder, Check } from "lucide-react";
import type { UserPlaylist } from "@/service/videoBookmarkService";

type BookmarkPlaylistModalProps = {
  isOpen: boolean;
  playlists: UserPlaylist[];
  isLoading: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  newPlaylistName: string;
  questionTitle: string;
  onClose: () => void;
  onNewPlaylistNameChange: (value: string) => void;
  onSelectExistingPlaylist: (playlistId: string) => void;
  onCreateAndAdd: () => void;
};

export default function BookmarkPlaylistModal({
  isOpen,
  playlists,
  isLoading,
  isSubmitting,
  errorMessage,
  newPlaylistName,
  questionTitle,
  onClose,
  onNewPlaylistNameChange,
  onSelectExistingPlaylist,
  onCreateAndAdd,
}: BookmarkPlaylistModalProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-[520px] overflow-hidden rounded-2xl border border-zinc-700/70 bg-[radial-gradient(circle_at_10%_0%,rgba(124,58,237,0.22),rgba(6,10,20,0.96)_45%),linear-gradient(170deg,#050915,#040710)] shadow-[0_0_48px_rgba(124,58,237,0.16)] flex flex-col"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            onClick={(event) => event.stopPropagation()}
            style={{ maxHeight: 'calc(100vh - 40px)' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-zinc-800/80 px-5 py-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-purple-500/40 bg-purple-500/10 p-2 text-purple-300">
                  <Bookmark className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Add to Playlist</h2>
                  {questionTitle && (
                    <p className="mt-0.5 text-xs text-zinc-400 max-w-[320px] truncate">
                      Current: <span className="text-zinc-300">{questionTitle}</span>
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800/60 hover:text-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 overflow-hidden px-5 py-4 space-y-6">
              
              {/* Create Playlist Section */}
              <div className="space-y-2 shrink-0">
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
                  PLAYLIST TITLE
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(event) => onNewPlaylistNameChange(event.target.value)}
                    placeholder="Enter playlist name..."
                    className="flex-1 rounded-xl border border-zinc-700/80 bg-zinc-900/60 px-4 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newPlaylistName.trim() && !isSubmitting) {
                        onCreateAndAdd();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={onCreateAndAdd}
                    disabled={isSubmitting || !newPlaylistName.trim()}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>
              </div>

              {/* Existing Playlists Section */}
              <div className="flex flex-col flex-1 min-h-[150px] overflow-hidden space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400 shrink-0">
                  Existing Playlists
                </h3>
                
                <div className="custom-scrollbar flex-1 overflow-y-auto pr-1 space-y-2 pb-2">
                  {isLoading ? (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-4 text-center text-sm text-zinc-400">
                      Loading playlists...
                    </div>
                  ) : playlists.length === 0 ? (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-4 text-center text-sm text-zinc-500">
                      No playlists found. Create one first.
                    </div>
                  ) : (
                    playlists.map((playlist) => (
                      <div
                        key={playlist.id}
                        className="group flex w-full items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/30 px-3 py-2.5 transition-all hover:border-purple-500/30 hover:bg-zinc-800/50"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <Folder className={`h-4 w-4 shrink-0 ${playlist.containsCurrentQuestion ? "text-emerald-400" : "text-purple-400"}`} />
                          <span className={`truncate text-sm font-medium ${playlist.containsCurrentQuestion ? "text-emerald-50" : "text-zinc-200"}`}>
                            {playlist.title}
                          </span>
                          {playlist.pinned && (
                            <span className="shrink-0 text-[10px] uppercase tracking-wider text-purple-500/70 border border-purple-500/20 bg-purple-500/10 px-1.5 rounded">Pinned</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => onSelectExistingPlaylist(playlist.id)}
                          disabled={isSubmitting}
                          className={`ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            playlist.containsCurrentQuestion
                              ? "bg-emerald-500/20 text-emerald-400 hover:bg-rose-500/20 hover:text-rose-300"
                              : "bg-zinc-800/80 text-zinc-400 hover:bg-purple-500 hover:text-white group-hover:bg-zinc-700"
                          }`}
                          title={playlist.containsCurrentQuestion ? "Remove from this playlist" : "Add to this playlist"}
                        >
                          {playlist.containsCurrentQuestion ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {errorMessage && (
                <div className="shrink-0 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {errorMessage}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
