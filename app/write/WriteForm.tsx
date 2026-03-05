'use client'

import { useState } from 'react'
import { submitEntry } from './actions'
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDiaryFont } from '@/lib/diary-font'
import { DiaryEditor } from '@/app/components/DiaryEditor'

type DiaryEntry = {
    id: string
    title: string | null
    content: string
    photos: string[] | null
}

export default function WriteForm({ initialData }: { initialData?: DiaryEntry | null }) {
    const [htmlContent, setHtmlContent] = useState(initialData?.content || '')
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { fontFamily } = useDiaryFont()

    return (
        <div className="flex-1 w-full flex flex-col items-center max-w-3xl mx-auto px-6 md:px-8 relative font-sans h-[100dvh] diary-paper">
            <header className="w-full flex justify-between items-center py-6 shrink-0">
                <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors gap-1 text-sm font-medium">
                    <ChevronLeft size={16} /> Back
                </Link>
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                    {initialData ? "Edit Entry" : "New Entry"}
                </span>
            </header>

            <form
                onSubmit={async (e) => {
                    e.preventDefault()
                    if (isSaving) return

                    setError(null)
                    setIsSaving(true)

                    const formData = new FormData(e.currentTarget)
                    formData.set('photos', JSON.stringify([]))
                    formData.set('content', htmlContent)
                    if (initialData?.id) {
                        formData.set('entryId', initialData.id)
                    }

                    try {
                        await submitEntry(formData)
                        // Note: submitEntry redirects on success, so we leave isSaving as true
                        // to keep the button in a loading state while the browser navigates.
                    } catch (err: any) {
                        setError(err.message || "An error occurred while saving.")
                        setIsSaving(false)
                    }
                }}
                className="w-full flex flex-col flex-1 relative"
            >

                <input
                    type="hidden"
                    name="photos"
                    value={JSON.stringify([])}
                />
                <input
                    type="hidden"
                    name="content"
                    value={htmlContent}
                />

                {initialData?.id && (
                    <input type="hidden" name="entryId" value={initialData.id} />
                )}

                <Input
                    name="title"
                    type="text"
                    defaultValue={initialData?.title || ''}
                    placeholder="Title (optional)"
                    className="text-foreground tracking-tight bg-transparent border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground w-full mb-4 h-auto"
                    style={{ fontFamily, fontSize: '2rem', lineHeight: '1.3' }}
                />

                <DiaryEditor
                    initialContent={htmlContent}
                    onChange={setHtmlContent}
                    fontFamily={fontFamily}
                />

                {error && (
                    <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-xl flex items-center justify-center gap-2 text-sm font-medium">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {/* Unified bottom toolbar */}
                <div className="sticky bottom-0 pb-6 pt-4 bg-gradient-to-t from-[#faf6f0] via-[#faf6f0]/95 to-transparent dark:from-[#1a1814] dark:via-[#1a1814]/95 flex items-center justify-end gap-3 z-20">
                    <Button
                        type="submit"
                        disabled={isSaving || htmlContent.length === 0}
                        className="rounded-full px-8 py-6 font-medium shadow-sm transition-all duration-300 ease-out hover:scale-105 hover:shadow-md active:scale-95 disabled:hover:scale-100 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Entry'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
