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
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { noteStyles } from '@/styles/notesStyles';
import { NoteService } from '@/service/notesService';
import { VideoStyleHeader } from '@/store/shared/VideoStyleHeader';

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
  <VideoStyleHeader activeLabel="Notes" />
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
      className={`${noteStyles.card} ${noteStyles.cardInteractive}`}
      style={{
        borderColor: `${note.accentColor}33`,
        background: `linear-gradient(160deg, ${note.accentColor}22 0%, #0B1333 45%)`,
      }}
      onClick={() => onView(note.id)}
      onDoubleClick={() => onEdit(note.id)}
      title={note.questionId ? "Title is fixed for question notes. Double click to edit content." : "Double click to edit"}
    >
      <div className={noteStyles.cardHeader}>
        <h3 className={noteStyles.cardTitle}>{note.subject}</h3>
        <div className={noteStyles.cardIcons}>
          <Trash2
            className={noteStyles.cardIcon}
            size={16}
            onClick={(event) => {
              event.stopPropagation();
              onDelete(note.id);
            }}
          />
          <Pin
            className={note.isPinned ? noteStyles.pinIconActive : noteStyles.pinIconInactive}
            size={16}
            fill={note.isPinned ? 'currentColor' : 'none'}
            onClick={(event) => {
              event.stopPropagation();
              onTogglePin(note.id);
            }}
          />
        </div>
      </div>
      <p className={noteStyles.cardDesc}>{NoteService.stripHtml(note.description)}</p>
      <div className={noteStyles.cardDate}>{note.date}</div>
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
        className={noteStyles.previewOverlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          className={noteStyles.previewDialog}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24 }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className={noteStyles.previewHeader}>
            <div className={noteStyles.previewTitleWrap}>
              <h2 className={noteStyles.previewTitle}>{note.subject}</h2>
              <p className={noteStyles.previewDate}>{note.date}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={noteStyles.previewCloseButton}
                onClick={() => {
                  onEdit(note.id);
                  onClose();
                }}
                aria-label="Edit note"
              >
                <SquarePen size={18} />
              </button>
              <button className={noteStyles.previewCloseButton} onClick={onClose} aria-label="Close note preview">
                <X size={20} />
              </button>
            </div>
          </div>
          <div className={noteStyles.previewBody}>
            <div className={noteStyles.previewContentBox}>
              <div
                className="note-preview-content"
                style={{ color: note.textColor }}
                dangerouslySetInnerHTML={{ __html: note.description }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const SearchBar = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => (
  <div className={noteStyles.searchContainer}>
    <Search className={noteStyles.searchIcon} />
    <input
      type="text"
      placeholder="Search note"
      className={noteStyles.searchInput}
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
  '#0EA5E9',
  '#3B82F6',
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
  const [showRightTextPalette, setShowRightTextPalette] = useState(false);
  const handleCloseModal = useCallback(() => {
    setShowRightTextPalette(false);
    onClose();
  }, [onClose]);
  const handleSaveModal = useCallback(() => {
    setShowRightTextPalette(false);
    onSave();
  }, [onSave]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      UnderlineExtension,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['paragraph', 'heading', 'bulletList', 'orderedList', 'listItem'] }),
      Placeholder.configure({ placeholder: 'Write your note here...' }),
    ],
    content: draft.description || '<p></p>',
    onUpdate: ({ editor: editorInstance }) => {
      onDraftChange({ description: editorInstance.getHTML() });
    },
  });

  useEffect(() => {
    if (!editor || !isOpen) return;
    const current = editor.getHTML();
    if (current !== draft.description) {
      editor.commands.setContent(draft.description || '<p></p>', { emitUpdate: false });
    }
  }, [draft.description, editor, isOpen]);

  useEffect(() => {
    if (!isOpen || !editor) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleCloseModal();
        return;
      }

      if (!event.ctrlKey) return;
      const key = event.key.toLowerCase();

      if (key === 'b') {
        event.preventDefault();
        editor.chain().focus().toggleBold().run();
      } else if (key === 'i') {
        event.preventDefault();
        editor.chain().focus().toggleItalic().run();
      } else if (key === 'u') {
        event.preventDefault();
        editor.chain().focus().toggleUnderline().run();
      } else if (key === 's') {
        event.preventDefault();
        handleSaveModal();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editor, isOpen, handleCloseModal, handleSaveModal]);

  if (!isOpen) return null;

  const textCount = (draft.subject.length + NoteService.stripHtml(draft.description).length).toString();

  const isActiveAlign = (align: 'left' | 'center' | 'right') => editor?.isActive({ textAlign: align }) ?? false;
  const activeColorStyle = { color: draft.textColor };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={noteStyles.editorOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <motion.div
            className={noteStyles.editorDialog}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 240, damping: 24 }}
          >
            <div className={noteStyles.editorScroll}>
              <div className={noteStyles.editorHeader}>
                <div className={noteStyles.editorTitleWrap}>
                  <div className={noteStyles.editorTitleIconWrap}>
                    <SquarePen size={18} />
                  </div>
                  <div className={noteStyles.editorHeadingGroup}>
                    <h2 className={noteStyles.editorTitle}>New Note</h2>
                    <p className={noteStyles.editorSubTitle}>Create &amp; Capture</p>
                  </div>
                </div>
                <button className={noteStyles.editorCloseButton} onClick={handleCloseModal} aria-label="Close note editor">
                  <X size={20} />
                </button>
              </div>

              <div className={noteStyles.editorToolbar}>
                <div className={noteStyles.editorToolbarLeft}>
                  <button
                    className={editor?.isActive('bold') ? noteStyles.editorToolButtonActive : noteStyles.editorToolButton}
                    aria-label="Bold"
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    style={editor?.isActive('bold') ? activeColorStyle : undefined}
                  >
                    <Bold size={18} />
                  </button>
                  <button
                    className={editor?.isActive('italic') ? noteStyles.editorToolButtonActive : noteStyles.editorToolButton}
                    aria-label="Italic"
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    style={editor?.isActive('italic') ? activeColorStyle : undefined}
                  >
                    <Italic size={18} />
                  </button>
                  <button
                    className={editor?.isActive('underline') ? noteStyles.editorToolButtonActive : noteStyles.editorToolButton}
                    aria-label="Underline"
                    onClick={() => editor?.chain().focus().toggleUnderline().run()}
                    style={editor?.isActive('underline') ? activeColorStyle : undefined}
                  >
                    <Underline size={18} />
                  </button>
                  <div className={noteStyles.editorSeparator} />
                  <button
                    className={showRightTextPalette ? noteStyles.editorToolButtonActive : noteStyles.editorToolButton}
                    aria-label="Text color"
                    onClick={() => setShowRightTextPalette(prev => !prev)}
                    style={showRightTextPalette ? activeColorStyle : undefined}
                  >
                    <span className="text-[12px] font-semibold leading-none tracking-tight" style={{ color: draft.textColor }}>
                      Aa
                    </span>
                  </button>
                  <button
                    className={editor?.isActive('bulletList') ? noteStyles.editorToolButtonActive : noteStyles.editorToolButton}
                    aria-label="Bulleted list"
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    style={editor?.isActive('bulletList') ? activeColorStyle : undefined}
                  >
                    <List size={18} />
                  </button>
                  <button
                    className={editor?.isActive('orderedList') ? noteStyles.editorToolButtonActive : noteStyles.editorToolButton}
                    aria-label="Numbered list"
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    style={editor?.isActive('orderedList') ? activeColorStyle : undefined}
                  >
                    <ListOrdered size={18} />
                  </button>
                  <div className={noteStyles.editorSeparator} />
                  <button
                    className={isActiveAlign('left') ? noteStyles.editorToolButtonActive : noteStyles.editorToolButton}
                    aria-label="Align left"
                    onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                    style={isActiveAlign('left') ? activeColorStyle : undefined}
                  >
                    <AlignLeft size={18} />
                  </button>
                  <button
                    className={isActiveAlign('center') ? noteStyles.editorToolButtonActive : noteStyles.editorToolButton}
                    aria-label="Align center"
                    onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                    style={isActiveAlign('center') ? activeColorStyle : undefined}
                  >
                    <AlignCenter size={18} />
                  </button>
                  <button
                    className={isActiveAlign('right') ? noteStyles.editorToolButtonActive : noteStyles.editorToolButton}
                    aria-label="Align right"
                    onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                    style={isActiveAlign('right') ? activeColorStyle : undefined}
                  >
                    <AlignRight size={18} />
                  </button>
                  <div className={noteStyles.editorSeparator} />
                  <button
                    className={draft.isPinned ? noteStyles.editorPinButtonActive : noteStyles.editorPinButton}
                    onClick={() => onDraftChange({ isPinned: !draft.isPinned })}
                    aria-label="Pin note"
                    style={draft.isPinned ? activeColorStyle : undefined}
                  >
                    <MapPin size={16} />
                    <span className="text-[16px] font-medium">Pin</span>
                  </button>
                </div>

                <div
                  className={`${noteStyles.editorColorGroup} transition-opacity duration-200 ${
                    showRightTextPalette ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  {rightTextColorOptions.map((color) => (
                    <button
                      key={color}
                      className={
                        draft.textColor === color ? noteStyles.editorColorButtonActive : noteStyles.editorColorButton
                      }
                      style={{ backgroundColor: color }}
                      onClick={() => onDraftChange({ textColor: color })}
                      aria-label={`Text color ${color}`}
                    />
                  ))}
                </div>
              </div>

              <div className={noteStyles.editorContent}>
                <div className={noteStyles.editorSubjectRow}>
                  <input
                    type="text"
                    value={draft.subject}
                    onChange={(e) => {
                      if (!isTitleLocked) {
                        onDraftChange({ subject: e.target.value });
                      }
                    }}
                    placeholder={isTitleLocked ? "Question title (fixed)" : "Note title"}
                    className={noteStyles.editorSubjectInput}
                    readOnly={isTitleLocked}
                    disabled={isTitleLocked}
                    maxLength={60}
                  />
                  <span className={noteStyles.editorCount}>{textCount}</span>
                </div>

                <div
                  className={noteStyles.editorBodyCard}
                  style={{
                    borderColor: `${draft.accentColor}66`,
                    background: `linear-gradient(160deg, ${draft.accentColor}2A 0%, ${draft.accentColor}1A 100%)`,
                  }}
                >
                  <div className={noteStyles.editorTextColorRow}>
                    {boxColorOptions.map((color) => (
                      <button
                        key={color}
                        className={
                          draft.accentColor === color
                            ? noteStyles.editorTextColorButtonActive
                            : noteStyles.editorTextColorButton
                        }
                        style={{ backgroundColor: color }}
                        onClick={() => onDraftChange({ accentColor: color })}
                        aria-label={`Box color ${color}`}
                      />
                    ))}
                  </div>

                  <div className="note-rich-editor note-rich-editor-wrap" style={{ color: draft.textColor }}>
                    <EditorContent editor={editor} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};




