"use client";

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import './rich-text-editor.css'; // Custom styles

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <div className="bg-customgreys-darkGrey border border-gray-600 rounded-md p-4 min-h-[200px] flex items-center justify-center">
      <p className="text-gray-400">Carregando editor...</p>
    </div>
  ),
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  disabled?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Escreva seu conteúdo aqui...",
  className = "",
  minHeight = "200px",
  disabled = false,
}) => {

  // Quill modules configuration
  const modules = useMemo(() => ({
    toolbar: [
      // Text formatting
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],

      // Inline styles
      ['bold', 'italic', 'underline', 'strike'],

      // Text color and background
      [{ 'color': [] }, { 'background': [] }],

      // Lists
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],

      // Alignment
      [{ 'align': [] }],

      // Links, images, videos
      ['link', 'image', 'video'],

      // Code blocks
      ['code-block', 'blockquote'],

      // Clear formatting
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    },
  }), []);

  // Quill formats allowed
  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'indent',
    'align',
    'link', 'image', 'video',
    'code-block', 'blockquote',
    'script', // superscript/subscript
  ];

  return (
    <div className={`rich-text-editor-wrapper ${className}`}>
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={disabled}
        style={{ minHeight }}
      />
    </div>
  );
};

export default RichTextEditor;
