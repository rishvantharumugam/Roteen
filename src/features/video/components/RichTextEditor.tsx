import React, { useRef, useEffect, useState } from "react";
import { 
  Bold, 
  Italic, 
  Underline, 
  Palette, 
  PaintBucket, 
  Highlighter,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const TEXT_COLORS = [
  { name: "White", value: "#FFFFFF" },
  { name: "Violet", value: "#8B5CF6" },
  { name: "Green", value: "#22C55E" },
  { name: "Red", value: "#EF4444" },
];

export const HILITE_COLORS = [
  { name: "No Highlight", value: "transparent" },
  { name: "Light Yellow", value: "#FEF08A" },
  { name: "Light Green", value: "#86EFAC" },
  { name: "Light Blue", value: "#93C5FD" },
  { name: "Light Violet", value: "#C4B5FD" },
  { name: "Light Red", value: "#FCA5A5" },
];

export const BOX_COLORS = [
  { name: "No Color", value: "transparent" },
  { name: "Dark Violet", value: "#2e1065" },
  { name: "Dark Blue", value: "#1e3a8a" },
  { name: "Dark Green", value: "#052e16" },
  { name: "Dark Red", value: "#450a0a" },
];

const SIZES = [
  { label: "12", value: "1" },
  { label: "14", value: "2" },
  { label: "16", value: "3" },
  { label: "18", value: "4" },
  { label: "20", value: "5" },
  { label: "24", value: "6" },
  { label: "32", value: "7" }
];

function rgbToHex(rgb: string) {
  const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return rgb.toUpperCase();
  const r = parseInt(match[1]).toString(16).padStart(2, "0");
  const g = parseInt(match[2]).toString(16).padStart(2, "0");
  const b = parseInt(match[3]).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`.toUpperCase();
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const containerId = "rte-" + React.useId().replace(/:/g, "");
  
  // Refs for buttons
  const sizeBtnRef = useRef<HTMLButtonElement>(null);
  const colorBtnRef = useRef<HTMLButtonElement>(null);
  const hiliteBtnRef = useRef<HTMLButtonElement>(null);
  const boxBtnRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const [popupConfig, setPopupConfig] = useState<{ type: string, top: number, left: number } | null>(null);
  const [boxColor, setBoxColor] = useState("");
  const isFocusedRef = useRef(false);

  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    size: "3",
    foreColor: "",
    hiliteColor: "",
    unorderedList: false,
    orderedList: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
  });

  useEffect(() => {
    try {
      document.execCommand("styleWithCSS", false, "true");
    } catch (e) { }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !sizeBtnRef.current?.contains(target) &&
        !colorBtnRef.current?.contains(target) &&
        !hiliteBtnRef.current?.contains(target) &&
        !boxBtnRef.current?.contains(target) &&
        !popupRef.current?.contains(target)
      ) {
        setPopupConfig(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (editorRef.current && typeof value === "string") {
      let html = value;
      let extractedColor = "";

      const match = html.match(/^<!--boxColor:([^>]+)-->/);
      if (match) {
        extractedColor = match[1];
        html = html.replace(/^<!--boxColor:[^>]+-->/, "");
      }

      // ONLY UPDATE IF NOT FOCUSED OR IF IT'S THE FIRST LOAD TO PREVENT FLICKERING/CURSOR LOSS
      if (!isFocusedRef.current) {
        if (editorRef.current.innerHTML !== html) {
          editorRef.current.innerHTML = html;
        }
        if (extractedColor !== boxColor) {
          setBoxColor(extractedColor);
        }
      }
    }
  }, [value, boxColor]);

  const handleInput = () => {
    if (editorRef.current) {
      // Fix Text Alignment behavior for Ordered Lists and Bullet Lists
      const listItems = editorRef.current.querySelectorAll('li');
      listItems.forEach(li => {
        Array.from(li.children).forEach(child => {
          const el = child as HTMLElement;
          if (el.style && el.style.textAlign) {
            li.style.textAlign = el.style.textAlign;
            el.style.display = 'inline';
          }
        });
      });

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
      foreColor: rgbToHex(document.queryCommandValue("foreColor") || ""),
      hiliteColor: rgbToHex(document.queryCommandValue("hiliteColor") || document.queryCommandValue("backColor") || ""),
      unorderedList: document.queryCommandState("insertUnorderedList"),
      orderedList: document.queryCommandState("insertOrderedList"),
      alignLeft: document.queryCommandState("justifyLeft"),
      alignCenter: document.queryCommandState("justifyCenter"),
      alignRight: document.queryCommandState("justifyRight"),
    });
  };

  const execCommand = (command: string, val: string | undefined = undefined) => {
    if (command === "hiliteColor") {
      command = "backColor";
    }

    if (command === "backColor" && val && val !== "transparent") {
      document.execCommand("foreColor", false, "#000000");
    }

    document.execCommand(command, false, val);
    handleInput();
    checkFormatting();
  };

  const togglePopup = (type: string, ref: React.RefObject<HTMLButtonElement | null>) => {
    if (popupConfig?.type === type) {
      setPopupConfig(null);
      return;
    }
    
    if (ref.current && containerRef.current) {
      const buttonRect = ref.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      let left = buttonRect.left - containerRect.left;
      
      // Prevent overflow on the right side
      if (left + 225 > containerRect.width) {
        left = containerRect.width - 225;
      }
      if (left < 4) left = 4;
      
      setPopupConfig({
        type,
        top: buttonRect.bottom - containerRect.top + 8,
        left
      });
    }
  };

  return (
    <div
      id={containerId}
      ref={containerRef}
      className="flex flex-1 flex-col w-full h-full rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-sm transition-all relative"
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        ${TEXT_COLORS.map(c => `#${containerId} font[color="${c.value}" i] { color: ${c.value} !important; }`).join('\n')}
        ${boxColor ? `#${containerId} { background-color: ${boxColor} !important; }` : ''}
        
        #${containerId} font[style*="background-color"], #${containerId} span[style*="background-color"] {
          padding: 0.18em 0;
          border-radius: 3px;
          -webkit-box-decoration-break: clone;
          box-decoration-break: clone;
        }
        
        #${containerId} ul { list-style-type: disc; margin-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 0.5rem; list-style-position: inside; }
        #${containerId} ol { list-style-type: decimal; margin-left: 1.5rem; margin-top: 0.5rem; margin-bottom: 0.5rem; list-style-position: inside; }
        #${containerId} font[size="1"] { font-size: 12px !important; }
        #${containerId} font[size="2"] { font-size: 14px !important; }
        #${containerId} font[size="3"] { font-size: 16px !important; }
        #${containerId} font[size="4"] { font-size: 18px !important; }
        #${containerId} font[size="5"] { font-size: 20px !important; }
        #${containerId} font[size="6"] { font-size: 24px !important; }
        #${containerId} font[size="7"] { font-size: 32px !important; }
      ` }} />

      <div 
        className="flex flex-nowrap shrink-0 items-center gap-2.5 border-b border-zinc-800 bg-black px-2 py-1.5 z-10 justify-start w-full overflow-x-auto no-scrollbar"
      >
        
        {/* Text Formats Group */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => execCommand("bold")} className={`flex shrink-0 h-7 w-7 items-center justify-center rounded transition ${activeFormats.bold ? "bg-purple-500/20 text-purple-400" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`} title="Bold">
            <Bold size={14} />
          </button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => execCommand("italic")} className={`flex shrink-0 h-7 w-7 items-center justify-center rounded transition ${activeFormats.italic ? "bg-purple-500/20 text-purple-400" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`} title="Italic">
            <Italic size={14} />
          </button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => execCommand("underline")} className={`flex shrink-0 h-7 w-7 items-center justify-center rounded transition ${activeFormats.underline ? "bg-purple-500/20 text-purple-400" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`} title="Underline">
            <Underline size={14} />
          </button>
        </div>

        <div className="h-5 w-px bg-zinc-700 shrink-0"></div>

        {/* Lists & Alignment Group */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => execCommand("insertUnorderedList")} className={`flex shrink-0 h-7 w-7 items-center justify-center rounded transition ${activeFormats.unorderedList ? "bg-purple-500/20 text-purple-400" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`} title="Bullet List">
            <List size={14} />
          </button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => execCommand("insertOrderedList")} className={`flex shrink-0 h-7 w-7 items-center justify-center rounded transition ${activeFormats.orderedList ? "bg-purple-500/20 text-purple-400" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`} title="Number List">
            <ListOrdered size={14} />
          </button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => execCommand("justifyLeft")} className={`flex shrink-0 h-7 w-7 items-center justify-center rounded transition ${activeFormats.alignLeft ? "bg-purple-500/20 text-purple-400" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`} title="Align Left">
            <AlignLeft size={14} />
          </button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => execCommand("justifyCenter")} className={`flex shrink-0 h-7 w-7 items-center justify-center rounded transition ${activeFormats.alignCenter ? "bg-purple-500/20 text-purple-400" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`} title="Align Center">
            <AlignCenter size={14} />
          </button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => execCommand("justifyRight")} className={`flex shrink-0 h-7 w-7 items-center justify-center rounded transition ${activeFormats.alignRight ? "bg-purple-500/20 text-purple-400" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`} title="Align Right">
            <AlignRight size={14} />
          </button>
        </div>

        <div className="h-5 w-px bg-zinc-700 shrink-0"></div>

        {/* Size & Color Picker Group */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button ref={sizeBtnRef} onMouseDown={(e) => e.preventDefault()} onClick={() => togglePopup('size', sizeBtnRef)} className="flex shrink-0 h-7 items-center justify-center rounded px-2 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white" title="Text Size">
            {SIZES.find(s => s.value === activeFormats.size)?.label || "16"}
          </button>
          
          <div className="mx-0.5 h-5 w-px bg-zinc-700 shrink-0"></div>

          <button ref={colorBtnRef} onMouseDown={(e) => e.preventDefault()} onClick={() => togglePopup('color', colorBtnRef)} className="flex shrink-0 h-7 w-7 items-center justify-center rounded text-zinc-400 transition hover:bg-zinc-800 hover:text-white" title="Text Color">
            <Palette size={14} />
          </button>
          <button ref={hiliteBtnRef} onMouseDown={(e) => e.preventDefault()} onClick={() => togglePopup('hilite', hiliteBtnRef)} className="flex shrink-0 h-7 w-7 items-center justify-center rounded text-zinc-400 transition hover:bg-zinc-800 hover:text-white" title="Text Highlight Color">
            <Highlighter size={14} />
          </button>
          <button ref={boxBtnRef} onMouseDown={(e) => e.preventDefault()} onClick={() => togglePopup('box', boxBtnRef)} className="flex shrink-0 h-7 w-7 items-center justify-center rounded text-zinc-400 transition hover:bg-zinc-800 hover:text-white" title="Box Background Color">
            <PaintBucket size={14} />
          </button>
        </div>
      </div>

      {/* Popups Rendered Relative to Editor Container to Avoid Clipping */}
      {popupConfig && (
        <div 
          ref={popupRef}
          style={{ top: popupConfig.top, left: popupConfig.left }}
          className="absolute z-[999] flex gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 p-2 shadow-xl"
        >
          {popupConfig.type === 'size' && (
            <div className="flex flex-col gap-1 w-24 max-h-48 overflow-y-auto custom-scrollbar">
              {SIZES.map(s => (
                <button
                  key={s.value}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { execCommand("fontSize", s.value); setPopupConfig(null); }}
                  className="rounded px-2 py-1 text-left text-xs text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {popupConfig.type === 'color' && (
            <>
              {TEXT_COLORS.map(c => {
                const isActive = activeFormats.foreColor === c.value;
                return (
                  <button
                    key={c.value}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { execCommand("foreColor", c.value); setPopupConfig(null); }}
                    className={`relative overflow-hidden flex shrink-0 items-center justify-center h-7 w-7 rounded-full border ${isActive ? 'border-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.8)]' : 'border-zinc-700'}`}
                    title={c.name}
                  >
                    <span className="absolute inset-0 h-full w-full rounded-full" style={{ backgroundColor: c.value }} />
                  </button>
                );
              })}
            </>
          )}

          {popupConfig.type === 'hilite' && (
            <>
              {HILITE_COLORS.map(c => {
                const isActive = activeFormats.hiliteColor === c.value || (c.value === "transparent" && !activeFormats.hiliteColor);
                const isTransparent = c.value === "transparent";
                return (
                  <button
                    key={c.value}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      execCommand("hiliteColor", c.value === "transparent" ? "rgba(0,0,0,0)" : c.value);
                      setPopupConfig(null);
                    }}
                    className={`relative overflow-hidden flex shrink-0 items-center justify-center h-7 w-7 rounded-full border ${isActive ? 'border-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.8)]' : isTransparent ? 'border-zinc-500 border-dashed' : 'border-zinc-700'}`}
                    title={c.name}
                  >
                    <span className="absolute inset-0 h-full w-full rounded-full" style={{ backgroundColor: isTransparent ? undefined : c.value }} />
                    {isTransparent && <span className="absolute w-[120%] h-[1px] bg-red-500/50 -rotate-45" />}
                  </button>
                );
              })}
            </>
          )}

          {popupConfig.type === 'box' && (
            <>
              {BOX_COLORS.map(c => {
                const isNone = c.value === "transparent";
                const isActive = isNone ? !boxColor : boxColor === c.value;
                return (
                  <button
                    key={c.value}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      const newColor = isNone ? "" : c.value;
                      setBoxColor(newColor);
                      setPopupConfig(null);
                      if (editorRef.current) {
                        const html = editorRef.current.innerHTML;
                        onChange(newColor ? `<!--boxColor:${newColor}-->${html}` : html);
                      }
                    }}
                    className={`relative overflow-hidden flex shrink-0 items-center justify-center h-7 w-7 rounded-full border ${isActive ? 'border-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.8)]' : isNone ? 'border-zinc-500 border-dashed' : 'border-zinc-700'}`}
                    title={c.name}
                  >
                    {!isNone && <span className="absolute inset-0 h-full w-full rounded-full" style={{ backgroundColor: c.value }} />}
                    {isNone && <span className="absolute w-[120%] h-[1px] bg-red-500/50 -rotate-45" />}
                  </button>
                );
              })}
            </>
          )}
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable
        onFocus={() => { isFocusedRef.current = true; checkFormatting(); }}
        onBlur={() => { isFocusedRef.current = false; handleInput(); }}
        onInput={handleInput}
        onKeyUp={checkFormatting}
        onMouseUp={checkFormatting}
        className="w-full min-h-[300px] p-4 text-zinc-200 outline-none whitespace-pre-wrap break-words overflow-y-auto leading-snug [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        data-placeholder="Write your notes here..."
        spellCheck="false"
      />
    </div>
  );
}
