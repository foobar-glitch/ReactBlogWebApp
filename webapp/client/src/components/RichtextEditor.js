import {
  BubbleMenu,
  EditorContent,
  FloatingMenu,
  useEditor,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect } from 'react'

const RichtextEditor = ({value, setBody}) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: `
      Add the Blog here
    ` + value,
  });

  // Listen to the editor content changes and update `body`
  useEffect(() => {
    if (editor) {
      editor.on('update', () => {
        const content = editor.getHTML(); // Get editor content as HTML
        setBody(content); // Update the body state in the parent form
      });
    }
  }, [editor, setBody]);

  return (
    <>
      {editor && (
        <BubbleMenu className="bubble-menu" tippyOptions={{ duration: 100 }} editor={editor}>
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active' : ''}
            type='button'
          >
            Bold
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
            type='button'
          >
            Italic
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'is-active' : ''}
            type='button'
          >
            Strike
          </button>
        </BubbleMenu>
      )}

      {editor && (
        <FloatingMenu className="floating-menu" tippyOptions={{ duration: 100 }} editor={editor}>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
            type='button'
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
            type='button'
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'is-active' : ''}
            type='button'
          >
            Bullet list
          </button>
        </FloatingMenu>
      )}

      <EditorContent editor={editor} />
    </>
  );
};

export default RichtextEditor;