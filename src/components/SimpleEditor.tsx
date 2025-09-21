'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import { Bold, Italic, List, Link as LinkIcon, Type, Minus } from 'lucide-react';

interface SimpleEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SimpleEditor({ value, onChange, placeholder = "내용을 입력하세요..." }: SimpleEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // StarterKit의 heading 비활성화
      }),
      Heading.configure({
        levels: [1, 2, 3, 4],
        HTMLAttributes: {
          class: 'font-bold',
        },
      }),
    ],
    content: value || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
        style: 'min-height: 300px; padding: 1rem;',
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      {/* 툴바 */}
      <div 
        className="flex items-center gap-2 p-3 border-b"
        style={{ 
          backgroundColor: 'var(--panel)',
          borderColor: 'var(--border)'
        }}
      >
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded transition-colors ${
            editor.isActive('bold') ? 'bg-[var(--blue)] text-white' : 'hover:bg-[var(--bg)]'
          }`}
          style={{ color: editor.isActive('bold') ? 'white' : 'var(--text)' }}
          title="굵게"
        >
          <Bold className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded transition-colors ${
            editor.isActive('italic') ? 'bg-[var(--blue)] text-white' : 'hover:bg-[var(--bg)]'
          }`}
          style={{ color: editor.isActive('italic') ? 'white' : 'var(--text)' }}
          title="기울임"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded transition-colors ${
            editor.isActive('bulletList') ? 'bg-[var(--blue)] text-white' : 'hover:bg-[var(--bg)]'
          }`}
          style={{ color: editor.isActive('bulletList') ? 'white' : 'var(--text)' }}
          title="목록"
        >
          <List className="w-4 h-4" />
        </button>

        <div className="w-px h-6 mx-2" style={{ backgroundColor: 'var(--border)' }} />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-[var(--blue)] text-white' : 'hover:bg-[var(--bg)]'
          }`}
          style={{ color: editor.isActive('heading', { level: 2 }) ? 'white' : 'var(--text)' }}
          title="소제목 (H2)"
        >
          <Type className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded transition-colors ${
            editor.isActive('heading', { level: 3 }) ? 'bg-[var(--blue)] text-white' : 'hover:bg-[var(--bg)]'
          }`}
          style={{ color: editor.isActive('heading', { level: 3 }) ? 'white' : 'var(--text)' }}
          title="소소제목 (H3)"
        >
          <Type className="w-3 h-3" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded transition-colors hover:bg-[var(--bg)]"
          style={{ color: 'var(--text)' }}
          title="구분선"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="w-px h-6 mx-2" style={{ backgroundColor: 'var(--border)' }} />

        <button
          type="button"
          onClick={() => {
            const url = prompt('링크 URL을 입력하세요:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`p-2 rounded transition-colors ${
            editor.isActive('link') ? 'bg-[var(--blue)] text-white' : 'hover:bg-[var(--bg)]'
          }`}
          style={{ color: editor.isActive('link') ? 'white' : 'var(--text)' }}
          title="링크"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        <div className="flex-1" />

        <span className="text-xs" style={{ color: 'var(--muted)' }}>
          Enter: 줄바꿈 | Shift+Enter: 새 단락
        </span>
      </div>

      {/* 에디터 영역 */}
      <div 
        className="min-h-[300px] p-4"
        style={{
          backgroundColor: 'var(--bg)',
          color: 'var(--text)'
        }}
      >
        <EditorContent 
          editor={editor}
          className="prose prose-invert max-w-none"
          style={{
            '--tw-prose-body': 'var(--text)',
            '--tw-prose-headings': 'var(--text)',
            '--tw-prose-links': 'var(--blue)',
            '--tw-prose-bold': 'var(--text)',
            '--tw-prose-counters': 'var(--muted)',
            '--tw-prose-bullets': 'var(--muted)',
          }}
        />
      </div>
    </div>
  );
}
