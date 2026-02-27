'use client'

import { useState } from 'react'
import { submitEntry } from './actions'
import { useDropzone } from 'react-dropzone'
import { ImagePlus, X, ChevronLeft, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useDiaryFont } from '@/lib/diary-font'

type DiaryEntry = {
    id: string
    title: string | null
    content: string
    photos: string[] | null
}

export default function WriteForm({ initialData }: { initialData?: DiaryEntry | null }) {
    const [photos, setPhotos] = useState<string[]>(initialData?.photos || [])
    const [uploading, setUploading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()
    const { fontFamily } = useDiaryFont()

    const onDrop = async (acceptedFiles: File[]) => {
        setUploading(true)
        const newPhotos = [...photos]

        for (const file of acceptedFiles) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error } = await supabase.storage
                .from('diary-photos')
                .upload(filePath, file)

            if (error) {
                console.error("Error uploading image: ", error)
            } else {
                const { data: { publicUrl } } = supabase.storage
                    .from('diary-photos')
                    .getPublicUrl(filePath)

                newPhotos.push(publicUrl)
            }
        }

        setPhotos(newPhotos)
        setUploading(false)
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': []
        }
    })

    const removePhoto = (index: number) => {
        setPhotos(photos.filter((_, i) => i !== index))
    }



    return (
        <div className="flex-1 w-full flex flex-col items-center max-w-3xl mx-auto px-4 md:px-0 relative font-sans h-[100dvh]">
            <header className="w-full flex justify-between items-center py-6 shrink-0">
                <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors gap-1 text-sm font-medium">
                    <ChevronLeft size={16} /> Back
                </Link>
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                    {initialData ? "Edit Entry" : "New Entry"}
                </span>
            </header>

            <form
                action={async (formData) => {
                    setError(null)
                    setIsSaving(true)
                    try {
                        await submitEntry(formData)
                    } catch (e: any) {
                        setError(e.message || "An error occurred while saving.")
                        setIsSaving(false)
                    }
                }}
                className="w-full flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pb-4"
            >

                <input
                    type="hidden"
                    name="photos"
                    value={JSON.stringify(photos)}
                />

                {initialData?.id && (
                    <input type="hidden" name="entryId" value={initialData.id} />
                )}

                <Input
                    name="title"
                    type="text"
                    defaultValue={initialData?.title || ''}
                    placeholder="Title (optional)"
                    className="text-foreground tracking-tight bg-transparent border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground w-full mb-6 h-auto"
                    style={{ fontFamily, fontSize: '2rem', lineHeight: '1.3' }}
                />

                <Textarea
                    name="content"
                    placeholder="What's on your mind today?"
                    required
                    autoFocus
                    defaultValue={initialData?.content || ''}
                    className="text-foreground bg-transparent border-none shadow-none focus-visible:ring-0 px-0 min-h-[40vh] resize-none placeholder:text-muted-foreground w-full mb-8"
                    style={{ fontFamily, fontSize: '1.35rem', lineHeight: '1.8' }}
                />

                <div className="mb-12">
                    {photos.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            {photos.map((url, i) => (
                                <div key={i} className="relative aspect-square rounded-lg bg-muted group animate-in fade-in zoom-in-95 duration-300 ease-out">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={url} alt={`Uploaded ${i}`} className="object-cover w-full h-full rounded-lg" />
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(i)}
                                        className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ease-out active:scale-[0.98] ${isDragActive ? 'border-primary bg-muted scale-[1.02]' : 'border-border hover:border-primary/50 hover:bg-muted/50 hover:shadow-sm'
                            }`}
                    >
                        <input {...getInputProps()} />
                        {uploading ? (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <Loader2 size={24} className="animate-spin" />
                                <span className="text-sm">Uploading...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <ImagePlus size={24} className="opacity-50" />
                                <span className="text-sm font-medium">Add photos to your entry</span>
                                <span className="text-xs font-light tracking-wide px-8">Drag &amp; drop or click to select</span>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-xl flex items-center justify-center gap-2 text-sm font-medium">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <div className="sticky bottom-0 pb-8 pt-4 bg-gradient-to-t from-background via-background to-transparent flex justify-end">
                    <Button
                        type="submit"
                        disabled={uploading || isSaving}
                        className="rounded-full px-8 py-6 font-medium shadow-sm transition-all duration-300 ease-out hover:scale-105 hover:shadow-md active:scale-95"
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
