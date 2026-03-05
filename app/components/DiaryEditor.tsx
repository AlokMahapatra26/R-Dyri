'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

type DiaryEditorProps = {
    initialContent: string
    onChange: (html: string) => void
    fontFamily: string
}

export function DiaryEditor({ initialContent, onChange, fontFamily }: DiaryEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "What's on your mind today? Write your story...",
                emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-muted-foreground/40 before:float-left before:pointer-events-none',
            }),
        ],
        content: initialContent,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-lg dark:prose-invert focus:outline-none max-w-none text-foreground bg-transparent min-h-[40vh] w-full diary-paper',
                style: `font-family: ${fontFamily}; font-size: 1.35rem; line-height: 40px;`,
            },
        },
    })

    if (!editor) {
        return null
    }

    return (
        <div className="relative w-full flex-1 flex flex-col">
            <EditorContent editor={editor} className="w-full relative z-0 flex-1" />
        </div>
    )
}
