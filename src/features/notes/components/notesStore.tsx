'use client';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Search,
  Trash2,
  Pin,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MapPin,
  SquarePen,
  X,
  FileText,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { NoteService } from '@/features/notes/services/notesService';
import RichTextEditor, { TEXT_COLORS } from '@/features/video/components/RichTextEditor';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';

export type Note = {
  id: string;
  questionId?: string | null;
  subject: string;
  description: string;
  date: string;
  isPinned: boolean;
  accentColor: string;
  textColor: string;
};

export type NewNoteDraft = {
  subject: string;
  description: string;
  isPinned: boolean;
  accentColor: string;
  textColor: string;
};

export const Navbar = () => (
  <DashboardHeader activeLabel="Notes" />
);

export const NoteCard = ({
  note,
  onTogglePin,
  onDelete,
  onEdit,
  onView,
}: {
  note: Note;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
}) => {
  return (
    <div
      className="w-full max-w-[240px] min-h-[220px] bg-[#121212] rounded-[18px] p-4 relative group transition-all border border-zinc-800 flex flex-col h-full cursor-pointer hover:-translate-y-0.5"
      onClick={() => onView(note.id)}
      onDoubleClick={() => onEdit(note.id)}
      title={note.questionId ? "Title is fixed for question notes. Double click to edit content." : "Double click to edit"}
    >
      <div className="flex justify-between items-start mb-4 gap-3">
        <div className="flex items-center gap-2.5 flex-1 pt-0.5">
          <div className="h-[7px] w-[7px] shrink-0 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
          <h3 className="text-[12px] font-bold tracking-[0.25em] text-gray-100 uppercase break-words">{note.subject}</h3>
        </div>
        <div className="flex items-center gap-3 pt-0.5">
          <Trash2
            className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer transition-colors"
            size={16}
            onClick={(event) => {
              event.stopPropagation();
              onDelete(note.id);
            }}
          />
          <Pin
            className={note.isPinned ? "h-4 w-4 cursor-pointer text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "h-4 w-4 cursor-pointer text-gray-400 transition-colors hover:text-white"}
            size={16}
            fill={note.isPinned ? 'currentColor' : 'none'}
            onClick={(event) => {
              event.stopPropagation();
              onTogglePin(note.id);
            }}
          />
        </div>
      </div>
      <p className="text-[14px] text-[#94A3B8] leading-relaxed min-h-[96px] font-medium flex-1">{NoteService.stripHtml(note.description)}</p>
      <div className="text-[11px] font-bold text-gray-400 mt-4 tracking-widest mt-auto">{note.date}</div>
    </div>
  );
};

type NotePreviewModalProps = {
  isOpen: boolean;
  note: Note | null;
  onClose: () => void;
  onEdit: (id: string) => void;
};

export const NotePreviewModal = ({ isOpen, note, onClose, onEdit }: NotePreviewModalProps) => {
  if (!isOpen || !note) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[85] bg-[#020615]/64 backdrop-blur-[5px] flex items-center justify-center p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-[760px] h-[min(84vh,760px)] rounded-[28px] border border-zinc-800 bg-[#121212] shadow-[0_28px_74px_rgba(0,0,0,0.95)] overflow-hidden"
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24 }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
            <div className="space-y-1">
              <h2 className="text-[20px] leading-tight font-extrabold tracking-tight text-white">{note.subject}</h2>
              <p className="text-[11px] tracking-[0.16em] font-semibold uppercase text-zinc-500">{note.date}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors cursor-pointer"
                onClick={() => {
                  onEdit(note.id);
                  onClose();
                }}
                aria-label="Edit note"
              >
                <SquarePen size={18} />
              </button>
              <button className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors cursor-pointer" onClick={onClose} aria-label="Close note preview">
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="px-6 py-5 overflow-y-auto h-[calc(84vh-88px)] note-preview-scroll cursor-pointer">
            <div
              id={`preview-${note.id}`}
              className="rounded-[20px] border border-zinc-800 px-5 py-4 min-h-full cursor-pointer transition-all"
              style={{
                backgroundColor: (() => {
                  const match = (note.description || "").match(/^<!--boxColor:([^>]+)-->/);
                  return match && match[1] ? match[1] : '#18181b';
                })(),
              }}
            >
              <style dangerouslySetInnerHTML={{ __html: `
                ${TEXT_COLORS.map(c => `font[color="${c.value}"] { color: ${c.value} !important; }`).join('\n')}
              ` }} />
              <div
                className="note-preview-content"
                style={{ color: note.textColor }}
                dangerouslySetInnerHTML={{ __html: (note.description || "").replace(/^<!--boxColor:[^>]+-->/, "") }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const SearchBar = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => (
  <div className="relative w-[340px]">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-400" />
    <input
      type="text"
      placeholder="Search note"
      className="w-full bg-[#121212] border border-zinc-800 focus:border-violet-500/50 rounded-full py-3 pl-11 pr-5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none transition-all"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const rightTextColorOptions = [
  '#F59E0B',
  '#EAB308',
  '#22C55E',
  '#14B8A6',
  '#8B5CF6',
  '#6D28D9',
  '#8B5CF6',
  '#EC4899',
  '#EF4444',
  '#334155',
];

// Notes page background palette (same soft palette as attached reference / video notes design).
const boxColorOptions = ['#C7D2FE', '#5EEAD4', '#93C5FD', '#F9A8D4', '#FDBA74', '#C4B5FD'];

type NewNoteModalProps = {
  isOpen: boolean;
  draft: NewNoteDraft;
  isTitleLocked?: boolean;
  onClose: () => void;
  onDraftChange: (updates: Partial<NewNoteDraft>) => void;
  onSave: () => void;
};

export const NewNoteModal = ({
  isOpen,
  draft,
  isTitleLocked = false,
  onClose,
  onDraftChange,
  onSave,
}: NewNoteModalProps) => {
  const handleCloseModal = useCallback(() => {
    onClose();
  }, [onClose]);
  const handleSaveModal = useCallback(() => {
    onSave();
  }, [onSave]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleCloseModal();
        return;
      }

      if (event.ctrlKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        handleSaveModal();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, handleCloseModal, handleSaveModal]);

  if (!isOpen) return null;

  const textCount = (draft.subject.length + NoteService.stripHtml(draft.description).length).toString();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[80] bg-[#020615]/58 backdrop-blur-[4px] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <motion.div
            className="w-full max-w-[930px] h-[min(72vh,590px)] rounded-[30px] border border-zinc-800 bg-[#121212] shadow-[0_24px_72px_rgba(0,0,0,0.95)] overflow-hidden"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 240, damping: 24 }}
          >
            <div className="h-full overflow-y-auto note-editor-scroll">
              <div className="flex items-center justify-between px-7 py-5 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-[40px] h-[40px] rounded-[11px] bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                    <SquarePen size={18} />
                  </div>
                  <div className="flex-1 ml-2">
                    <input
                      type="text"
                      value={draft.subject}
                      onChange={(e) => {
                        if (!isTitleLocked) {
                          onDraftChange({ subject: e.target.value });
                        }
                      }}
                      placeholder={isTitleLocked ? "Question title (fixed)" : "Note title"}
                      className="bg-transparent border-none text-zinc-100 font-bold text-base focus:outline-none w-full placeholder:text-zinc-600 focus:ring-0"
                      readOnly={isTitleLocked}
                      disabled={isTitleLocked}
                      maxLength={60}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500 font-medium">{textCount} chars</span>
                  <button
                    className={draft.isPinned ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "text-gray-400 transition-colors hover:text-white"}
                    onClick={() => onDraftChange({ isPinned: !draft.isPinned })}
                    aria-label="Pin note"
                  >
                    <Pin size={16} fill={draft.isPinned ? 'currentColor' : 'none'} />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors cursor-pointer" onClick={handleCloseModal} aria-label="Close note editor">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="px-7 py-5 space-y-5">
                <div className="h-[400px] mt-2">
                  <RichTextEditor 
                    value={draft.description}
                    onChange={(val) => onDraftChange({ description: val })}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};




