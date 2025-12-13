
import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, RotateCcw, RotateCw, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Type, Heading1, Heading2, Quote, Pilcrow, Eraser } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    // Sync content when the 'value' prop changes (e.g., clicking Edit on a different article)
    useEffect(() => {
        if (contentRef.current) {
            // Only update if the new value is substantially different or empty to avoid cursor jumping during typing
            // This ensures when you click "Edit", the content actually loads.
            if (contentRef.current.innerHTML !== value) {
                // If the editor is empty (initial load) or the value changed significantly (switching articles)
                if (contentRef.current.innerHTML === '' || Math.abs(contentRef.current.innerHTML.length - value.length) > 5) {
                     contentRef.current.innerHTML = value;
                }
            }
        }
    }, [value]);

    const execCommand = (command: string, val?: string) => {
        document.execCommand(command, false, val);
        if (contentRef.current) {
            onChange(contentRef.current.innerHTML);
        }
    };

    const handleInput = () => {
        if (contentRef.current) {
            onChange(contentRef.current.innerHTML);
        }
    };

    return (
        <div className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
            <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200 text-gray-700 items-center">
                <button type="button" onClick={() => execCommand('bold')} className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Bold"><Bold size={16}/></button>
                <button type="button" onClick={() => execCommand('italic')} className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Italic"><Italic size={16}/></button>
                <button type="button" onClick={() => execCommand('underline')} className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Underline"><Underline size={16}/></button>
                
                <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

                <button type="button" onClick={() => execCommand('formatBlock', 'H2')} className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Large Heading (H2)"><Heading1 size={16}/></button>
                <button type="button" onClick={() => execCommand('formatBlock', 'H3')} className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Small Heading (H3)"><Heading2 size={16}/></button>
                <button type="button" onClick={() => execCommand('formatBlock', 'P')} className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Normal Text (Paragraph)"><Pilcrow size={16}/></button>
                <button type="button" onClick={() => execCommand('formatBlock', 'BLOCKQUOTE')} className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Quote"><Quote size={16}/></button>

                <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

                <button type="button" onClick={() => execCommand('justifyLeft')} className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Align Left"><AlignLeft size={16}/></button>
                <button type="button" onClick={() => execCommand('justifyCenter')} className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Align Center"><AlignCenter size={16}/></button>
                <button type="button" onClick={() => execCommand('justifyRight')} className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Align Right"><AlignRight size={16}/></button>
                
                <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

                <button type="button" onClick={() => execCommand('insertUnorderedList')} className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Bullet List"><List size={16}/></button>
                <button type="button" onClick={() => execCommand('insertOrderedList')} className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Numbered List"><ListOrdered size={16}/></button>

                <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

                <div className="flex items-center gap-1 p-1.5 hover:bg-gray-200 rounded cursor-pointer relative group transition-colors" title="Text Color">
                    <Type size={16} />
                    <input 
                        type="color" 
                        onChange={(e) => execCommand('foreColor', e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                </div>
                
                {/* Clear Formatting Button - Fixes font size mismatch */}
                <button type="button" onClick={() => execCommand('removeFormat')} className="p-1.5 hover:bg-gray-200 rounded transition-colors text-red-600" title="Clear Formatting (Fix Fonts)"><Eraser size={16}/></button>

                <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

                <button type="button" onClick={() => execCommand('undo')} className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Undo"><RotateCcw size={16}/></button>
                <button type="button" onClick={() => execCommand('redo')} className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Redo"><RotateCw size={16}/></button>
            </div>
            <div 
                ref={contentRef}
                className="p-4 min-h-[400px] outline-none prose prose-sm max-w-none font-serif text-lg leading-relaxed cursor-text"
                contentEditable
                onInput={handleInput}
                suppressContentEditableWarning={true}
            />
        </div>
    );
};
