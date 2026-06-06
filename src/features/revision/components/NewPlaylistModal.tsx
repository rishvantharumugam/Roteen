import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { NewPlaylistDraft } from '@/features/revision/components/revisionTypes';

interface NewPlaylistModalProps {
  isOpen: boolean;
  draft: NewPlaylistDraft;
  onClose: () => void;
  onDraftChange: (updates: Partial<NewPlaylistDraft>) => void;
  onSave: () => void;
}

export const NewPlaylistModal: React.FC<NewPlaylistModalProps> = ({
  isOpen,
  draft,
  onClose,
  onDraftChange,
  onSave,
}) => {
  
  // Handle keyboard shortcuts (Escape to close, Ctrl+Enter to save)
  useEffect(() => {
    if (!isOpen) return;
    
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        onSave();
      }
    };
    
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, onSave]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-md bg-[#121212] border border-zinc-800 rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 pb-4 border-b border-zinc-800">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-white tracking-tight">New Playlist</h2>
              <p className="text-sm text-gray-400 font-medium">Create a new revision topic</p>
            </div>
            <button 
              className="text-gray-400 hover:text-white transition-colors cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5" 
              onClick={onClose}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-gray-300 ml-1 uppercase tracking-wider">Title</label>
              <input
                type="text"
                placeholder="e.g. Advanced Calculus"
                className="w-full bg-black border border-zinc-800 focus:border-[#8B5CF6]/50 rounded-xl px-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all focus:shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                value={draft.title}
                onChange={(e) => onDraftChange({ title: e.target.value })}
                autoFocus
              />
            </div>
            
          </div>
          
          <div className="p-6 pt-4 flex justify-end gap-3 bg-[#0A0A0A] border-t border-zinc-800">
            <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer" onClick={onClose}>
              Cancel
            </button>
            <button className="px-6 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-sm font-semibold shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all cursor-pointer" onClick={onSave}>
              Create Playlist
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};


