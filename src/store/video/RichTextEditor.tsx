import React, { useRef, useEffect, useState } from "react";
import { Bold, Italic, Underline, Palette, PaintBucket } from "lucide-react";
import { videoStyles } from "@/styles/video";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const COLORS = ["#ededed", "#a855f7", "#3b82f6", "#ef4444", "#22c55e", "#f59e0b"];
const BOX_COLORS = ["#18181b", "#0f172a", "#1e1e2e", "#171717", "#2e1065", "#064e3b", "#4c0519", "#713f12"];
const SIZES = [
  { label: "S", value: "2" },
  { label: "M", value: "3" },
  { label: "L", value: "4" },
  { label: "XL", value: "5" },
  { label: "XXL", value: "6" }
];

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showColor, setShowColor] = useState(false);
  const [showBoxColor, setShowBoxColor] = useState(false);
  const [showSize, setShowSize] = useState(false);
  const [boxColor, setBoxColor] = useState("");
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    size: "3",
  });

  // Parse the box color from the incoming HTML if present
  useEffect(() => {
    if (editorRef.current && typeof value === "string") {
      let html = value;
      let extractedColor = "";

      const match = html.match(/^<!--boxColor:([^>]+)-->/);
      if (match) {
        extractedColor = match[1];
        html = html.replace(/^<!--boxColor:[^>]+-->/, "");
      }

      if (editorRef.current.innerHTML !== html) {
        editorRef.current.innerHTML = html;
      }
      
      if (extractedColor !== boxColor) {
        setBoxColor(extractedColor);
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      let html = editorRef.current.innerHTML;
      if (boxColor) {
        html = `<!--boxColor:${boxColor}-->${html}`;
      }
      onChange(html);
    }
  };

  const checkFormatting = () => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      size: document.queryCommandValue("fontSize") || "3",
    });
  };

  const execCommand = (command: string, val: string | undefined = undefined) => {
    // For background color compatibility across browsers
    if (command === "hiliteColor" && !document.queryCommandSupported("hiliteColor")) {
      command = "backColor";
    }

    document.execCommand(command, false, val);
    if (editorRef.current) editorRef.current.focus();
    handleInput();
    checkFormatting();
  };

  return (
    <div
      className={videoStyles.style_1f806397ef2bb1}
      style={boxColor ? { backgroundColor: boxColor } : undefined}
    >
      {/* Toolbar */}
      <div className={videoStyles.style_13904ce13c7893}>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => execCommand("bold")} className={`flex h-7 w-7 items-center justify-center rounded transition ${activeFormats.bold ? "bg-purple-500/20 text-purple-400" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`} title="Bold">
          <Bold size={14} />
        </button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => execCommand("italic")} className={`flex h-7 w-7 items-center justify-center rounded transition ${activeFormats.italic ? "bg-purple-500/20 text-purple-400" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`} title="Italic">
          <Italic size={14} />
        </button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => execCommand("underline")} className={`flex h-7 w-7 items-center justify-center rounded transition ${activeFormats.underline ? "bg-purple-500/20 text-purple-400" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`} title="Underline">
          <Underline size={14} />
        </button>

        <div className={videoStyles.style_4df1c54b5d4c7}></div>

        <div className={videoStyles.style_1199ad5e322b4e}>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => { setShowSize(!showSize); setShowBoxColor(false); setShowColor(false); }} className={videoStyles.style_15f3250d52cddd} title="Text Size">
            {SIZES.find(s => s.value === activeFormats.size)?.label || "Normal"}
          </button>
          {showSize && (
            <div className={videoStyles.style_1ef8d61941b890}>
              {SIZES.map(s => (
                <button
                  key={s.value}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { execCommand("fontSize", s.value); setShowSize(false); }}
                  className={videoStyles.style_4c9ad46f69ab5}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={videoStyles.style_4df1c54b5d4c7}></div>

        <div className={videoStyles.style_1199ad5e322b4e}>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => { setShowBoxColor(!showBoxColor); setShowSize(false); setShowColor(false); }} className={videoStyles.style_150a2c033764af} title="Box Background Color">
            <PaintBucket size={14} />
          </button>
          {showBoxColor && (
            <div className={videoStyles.style_9c2c64c356349}>
              {BOX_COLORS.map(c => (
                <button
                  key={c}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { 
                    const newColor = c === "#18181b" ? "" : c;
                    setBoxColor(newColor); 
                    setShowBoxColor(false);
                    
                    // Force an immediate update so the color saves to the DB
                    if (editorRef.current) {
                      const html = editorRef.current.innerHTML;
                      onChange(newColor ? `<!--boxColor:${newColor}-->${html}` : html);
                    }
                  }}
                  className={videoStyles.style_1633eeaad17964}
                  style={{ backgroundColor: c }}
                  title="Change Box Color"
                />
              ))}
            </div>
          )}
        </div>

        <div className={videoStyles.style_1199ad5e322b4e}>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => { setShowColor(!showColor); setShowSize(false); setShowBoxColor(false); }} className={videoStyles.style_150a2c033764af} title="Text Color">
            <Palette size={14} />
          </button>
          {showColor && (
            <div className={videoStyles.style_9c2c64c356349}>
              {COLORS.map(c => (
                <button
                  key={c}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { execCommand("foreColor", c); setShowColor(false); }}
                  className={videoStyles.style_1633eeaad17964}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyUp={checkFormatting}
        onMouseUp={checkFormatting}
        className={videoStyles.style_1f16f4bcacac87}
        style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        data-placeholder="Write your notes here..."
        spellCheck="false"
      />
    </div>
  );
}
