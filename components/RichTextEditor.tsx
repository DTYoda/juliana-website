"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

// Custom extension to preserve whitespace
interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing...",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        hardBreak: {
          keepMarks: true,
        },
        // Ensure lists are enabled and working
        bulletList: {
          HTMLAttributes: {
            class: 'bullet-list',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'ordered-list',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'list-item',
          },
        },
        // Disable paragraph to allow better whitespace handling
        paragraph: {
          HTMLAttributes: {
            class: 'paragraph',
          },
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // Store both HTML and JSON
      // HTML for display, JSON for preserving whitespace and structure
      const html = editor.getHTML();
      const json = editor.getJSON();
      
      // Embed JSON in HTML comment for extraction during markdown conversion
      const htmlWithData = html + `<!-- TIPTAP_JSON:${JSON.stringify(json)} -->`;
      onChange(htmlWithData);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none min-h-[500px] p-6 focus:outline-none whitespace-pre-wrap",
        style: "white-space: pre-wrap;",
      },
      handlePaste: (view, event) => {
        // Allow paste from Google Docs and other rich text sources
        return false; // Let TipTap handle it natively
      },
      handleKeyDown: (view, event) => {
        // Handle Tab key for indentation
        if (event.key === "Tab") {
          const { state } = view;
          const { selection } = state;
          
          // Check if we're in a list - if so, let TipTap handle list indentation
          const { $from } = selection;
          const isInList = $from.node(-1)?.type.name === 'listItem' || 
                          $from.node(-2)?.type.name === 'bulletList' || 
                          $from.node(-2)?.type.name === 'orderedList';
          
          if (isInList) {
            // Let TipTap handle list indentation natively
            return false;
          }
          
          // Otherwise, handle custom indentation for non-list content
          event.preventDefault();
          const { from, to } = selection;
          
          // If text is selected, indent each line of the selection
          if (from !== to) {
            const selectedText = state.doc.textBetween(from, to);
            const lines = selectedText.split("\n");
            const indentedText = lines.map((line) => "    " + line).join("\n");
            editor?.chain().focus().deleteSelection().insertContent(indentedText).run();
            return true;
          }
          
          // Otherwise, insert 4 spaces at cursor position
          editor?.chain().focus().insertContent("    ").run();
          return true;
        }
        
        // Allow Shift+Enter to insert hard break (line break without new paragraph)
        // This allows multiple line breaks for stylistic spacing
        if (event.key === "Enter" && event.shiftKey) {
          event.preventDefault();
          editor?.chain().focus().setHardBreak().run();
          return true;
        }
        
        return false;
      },
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content) {
      // Extract just the HTML part (remove embedded data if present)
      const htmlOnly = content.replace(/<!-- TIPTAP_.*? -->/, '');
      if (htmlOnly !== editor.getHTML()) {
        editor.commands.setContent(htmlOnly);
      }
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-cyan-200 rounded-lg bg-white">
      {/* Toolbar */}
      <div className="border-b border-cyan-200 p-3 flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive("bold")
              ? "bg-cyan-500 text-white"
              : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
          }`}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive("italic")
              ? "bg-cyan-500 text-white"
              : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
          }`}
        >
          <em>I</em>
        </button>
        <div className="w-px bg-cyan-200 mx-1" />
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive("heading", { level: 1 })
              ? "bg-cyan-500 text-white"
              : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-cyan-500 text-white"
              : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive("heading", { level: 3 })
              ? "bg-cyan-500 text-white"
              : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
          }`}
        >
          H3
        </button>
        <div className="w-px bg-cyan-200 mx-1" />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            if (editor) {
              editor.view.focus();
              // Use command chain to ensure it works
              const { state } = editor.view;
              const { $from } = state.selection;
              
              // If we're not in a list and there's no content, create a list item
              if (!editor.isActive("bulletList") && !editor.isActive("orderedList")) {
                // Check if current node is empty paragraph
                if ($from.parent.type.name === "paragraph" && $from.parent.content.size === 0) {
                  editor.chain().focus().toggleBulletList().run();
                } else {
                  editor.chain().focus().toggleBulletList().run();
                }
              } else {
                editor.chain().focus().toggleBulletList().run();
              }
            }
          }}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive("bulletList")
              ? "bg-cyan-500 text-white"
              : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
          }`}
        >
          •
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            if (editor) {
              editor.view.focus();
              // Use command chain to ensure it works
              const { state } = editor.view;
              const { $from } = state.selection;
              
              // If we're not in a list and there's no content, create a list item
              if (!editor.isActive("bulletList") && !editor.isActive("orderedList")) {
                // Check if current node is empty paragraph
                if ($from.parent.type.name === "paragraph" && $from.parent.content.size === 0) {
                  editor.chain().focus().toggleOrderedList().run();
                } else {
                  editor.chain().focus().toggleOrderedList().run();
                }
              } else {
                editor.chain().focus().toggleOrderedList().run();
              }
            }
          }}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive("orderedList")
              ? "bg-cyan-500 text-white"
              : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
          }`}
        >
          1.
        </button>
        <div className="w-px bg-cyan-200 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive("blockquote")
              ? "bg-cyan-500 text-white"
              : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
          }`}
        >
          "
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-3 py-1.5 rounded text-sm font-medium bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-colors"
        >
          ─
        </button>
      </div>

      {/* Editor */}
      <div className="prose-wrapper">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

