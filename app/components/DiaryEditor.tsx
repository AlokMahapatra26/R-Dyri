'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Loader2 } from 'lucide-react'
import { useState, useRef, useImperativeHandle, forwardRef } from 'react'
import imageCompression from 'browser-image-compression'
import { createClient } from '@/lib/supabase/client'

export type DiaryEditorRef = {
    triggerImageUpload: () => void
}

type DiaryEditorProps = {
    initialContent: string
    onChange: (html: string) => void
    onPhotoAdded: (url: string) => void
    fontFamily: string
    onUploadingChange?: (uploading: boolean) => void
}

export const DiaryEditor = forwardRef<DiaryEditorRef, DiaryEditorProps>(function DiaryEditor(
    { initialContent, onChange, onPhotoAdded, fontFamily, onUploadingChange },
    ref
) {
    const supabase = createClient()
    const fileInputRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
        triggerImageUpload: () => fileInputRef.current?.click()
    }))

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Image.configure({
                HTMLAttributes: {
                    class: 'diary-photo',
                },
            }),
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

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file || !editor) return

        try {
            onUploadingChange?.(true)

            // 1. Compress image
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                fileType: 'image/webp'
            }
            const compressedFile = await imageCompression(file, options)

            // 2. Upload to Supabase
            const fileName = `${Math.random().toString(36).substring(7)}.webp`
            const { error } = await supabase.storage
                .from('diary-photos')
                .upload(fileName, compressedFile)

            if (error) throw error

            // 3. Get public URL and insert into editor
            const { data: { publicUrl } } = supabase.storage
                .from('diary-photos')
                .getPublicUrl(fileName)

            editor.chain().focus().setImage({ src: publicUrl }).run()
            onPhotoAdded(publicUrl)

        } catch (error) {
            console.error('Error uploading image:', error)
            alert('Failed to upload image. Please try again.')
        } finally {
            onUploadingChange?.(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    if (!editor) {
        return null
    }

    return (
        <div className="relative w-full flex-1 flex flex-col">
            <EditorContent editor={editor} className="w-full relative z-0 flex-1" />
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageUpload}
            />
        </div>
    )
})
