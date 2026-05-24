import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { revisionStyles } from '@/styles/revisionStyles';
import { NewPlaylistDraft } from '@/store/revision/revisionTypes';

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
        className={revisionStyles.modalOverlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          className={revisionStyles.modalDialog}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={revisionStyles.modalHeader}>
            <div className={revisionStyles.modalTitleWrap}>
              <h2 className={revisionStyles.modalTitle}>New Playlist</h2>
              <p className={revisionStyles.modalSubtitle}>Create a new revision topic</p>
            </div>
            <button 
              className={revisionStyles.modalCloseBtn} 
              onClick={onClose}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className={revisionStyles.modalBody}>
            <div className={revisionStyles.inputGroup}>
              <label className={revisionStyles.inputLabel}>Title</label>
              <input
                type="text"
                placeholder="e.g. Advanced Calculus"
                className={revisionStyles.inputField}
                value={draft.title}
                onChange={(e) => onDraftChange({ title: e.target.value })}
                autoFocus
              />
            </div>
            
          </div>
          
          <div className={revisionStyles.modalFooter}>
            <button className={revisionStyles.btnCancel} onClick={onClose}>
              Cancel
            </button>
            <button className={revisionStyles.btnCreate} onClick={onSave}>
              Create Playlist
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};


