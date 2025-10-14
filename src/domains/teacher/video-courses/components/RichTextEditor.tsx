"use client";

import React, { useState, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link, 
  Heading1, 
  Heading2,
  Quote,
  Code,
  Eye,
  Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Digite o conteúdo...",
  className = "",
  rows = 6
}) => {
  const [content, setContent] = useState(value);
  const [previewMode, setPreviewMode] = useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(value);
  }, [value]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onChange(newContent);
  };

  const insertMarkdown = (before: string, after: string = "", placeholder: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newContent = 
      content.substring(0, start) + 
      before + textToInsert + after + 
      content.substring(end);
    
    handleContentChange(newContent);
    
    // Restore focus and position cursor
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos + after.length);
    }, 0);
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newContent = 
      content.substring(0, start) + 
      text + 
      content.substring(end);
    
    handleContentChange(newContent);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + text.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Markdown to HTML converter (basic)
  const markdownToHtml = (markdown: string) => {
    return markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-800 px-1 rounded">$1</code>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mb-3">$1</h2>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-violet-500 pl-4 italic">$1</blockquote>')
      .replace(/^\* (.*$)/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li>$1. $2</li>')
      .replace(/\n/g, '<br>');
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertMarkdown('**', '**', 'texto em negrito'), tooltip: 'Negrito' },
    { icon: Italic, action: () => insertMarkdown('*', '*', 'texto em itálico'), tooltip: 'Itálico' },
    { icon: Underline, action: () => insertMarkdown('__', '__', 'texto sublinhado'), tooltip: 'Sublinhado' },
    { icon: Heading1, action: () => insertAtCursor('# '), tooltip: 'Título 1' },
    { icon: Heading2, action: () => insertAtCursor('## '), tooltip: 'Título 2' },
    { icon: List, action: () => insertAtCursor('* '), tooltip: 'Lista' },
    { icon: ListOrdered, action: () => insertAtCursor('1. '), tooltip: 'Lista Numerada' },
    { icon: Quote, action: () => insertAtCursor('> '), tooltip: 'Citação' },
    { icon: Code, action: () => insertMarkdown('`', '`', 'código'), tooltip: 'Código' },
    { icon: Link, action: () => insertMarkdown('[', '](url)', 'texto do link'), tooltip: 'Link' },
  ];

  return (
    <div className={`border border-indigo-500/30 rounded-lg bg-customgreys-darkGrey/50 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-indigo-500/20">
        <div className="flex items-center gap-1">
          {toolbarButtons.map(({ icon: Icon, action, tooltip }, index) => (
            <Button
              key={index}
              type="button"
              onClick={action}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-indigo-500/20"
              title={tooltip}
            >
              <Icon className="w-4 h-4" />
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            variant="ghost"
            size="sm"
            className={`h-8 px-3 text-xs ${
              previewMode 
                ? 'text-violet-400 bg-violet-500/20' 
                : 'text-gray-400 hover:text-white hover:bg-indigo-500/20'
            }`}
          >
            {previewMode ? <Edit3 className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
            {previewMode ? 'Editar' : 'Preview'}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4">
        {previewMode ? (
          // Preview Mode
          <div className="min-h-[200px] prose prose-invert max-w-none">
            <div 
              className="text-white leading-relaxed"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
            />
            {!content && (
              <p className="text-gray-500 italic">Nenhum conteúdo para preview...</p>
            )}
          </div>
        ) : (
          // Edit Mode
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full bg-transparent text-white placeholder:text-gray-400 focus:outline-none resize-none"
            style={{ minHeight: '200px' }}
          />
        )}
      </div>

      {/* Help Text */}
      <div className="px-4 pb-3 text-xs text-gray-500">
        Suporte a Markdown: **negrito**, *itálico*, `código`, # títulos, * listas, &gt; citações
      </div>
    </div>
  );
};

export default RichTextEditor;