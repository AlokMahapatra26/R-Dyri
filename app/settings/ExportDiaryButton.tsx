'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import JSZip from 'jszip'
import { createClient } from '@/lib/supabase/client'

const stripHtml = (html: string) => html ? html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim() : ''

export default function ExportDiaryButton() {
    const [exporting, setExporting] = useState(false)
    const [progress, setProgress] = useState('')

    const handleExport = async () => {
        setExporting(true)
        setProgress('Fetching entries...')

        try {
            const supabase = createClient()

            // Fetch all diary entries
            const { data: entries, error } = await supabase
                .from('diaries')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            if (!entries || entries.length === 0) {
                alert('No diary entries to export.')
                setExporting(false)
                setProgress('')
                return
            }

            // Fetch profile names for user IDs
            const userIds = [...new Set(entries.map(e => e.user_id))]
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, name')
                .in('id', userIds)

            const nameMap: Record<string, string> = {}
            profiles?.forEach(p => {
                nameMap[p.id] = p.name || 'Unknown'
            })

            setProgress('Creating ZIP...')
            const zip = new JSZip()
            const entriesFolder = zip.folder('entries')!

            let photoCount = 0
            const totalEntries = entries.length

            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i]
                const date = new Date(entry.created_at)
                const dateStr = date.toISOString().split('T')[0]
                const timeStr = date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                })
                const safeTitle = (entry.title || 'Untitled')
                    .replace(/[^a-zA-Z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .substring(0, 40)

                const folderName = `${dateStr}_${safeTitle}_${i + 1}`
                const entryFolder = entriesFolder.folder(folderName)!

                // Build entry text content
                const authorName = nameMap[entry.user_id] || 'Unknown'
                const entryText = [
                    `Title: ${entry.title || 'Untitled'}`,
                    `Author: ${authorName}`,
                    `Date: ${dateStr}`,
                    `Time: ${timeStr}`,
                    `Created At: ${entry.created_at}`,
                    entry.logical_date ? `Logical Date: ${entry.logical_date}` : null,
                    '',
                    '---',
                    '',
                    stripHtml(entry.content) || '',
                ].filter(Boolean).join('\n')

                entryFolder.file('entry.txt', entryText)

                // Download photos
                if (entry.photos && entry.photos.length > 0) {
                    setProgress(`Processing entry ${i + 1}/${totalEntries} (${entry.photos.length} photos)...`)

                    for (let j = 0; j < entry.photos.length; j++) {
                        const photoUrl = entry.photos[j]
                        try {
                            const response = await fetch(photoUrl)
                            if (response.ok) {
                                const blob = await response.blob()
                                const ext = photoUrl.split('.').pop()?.split('?')[0] || 'jpg'
                                entryFolder.file(`photo_${j + 1}.${ext}`, blob)
                                photoCount++
                            }
                        } catch (photoErr) {
                            console.error(`Failed to download photo: ${photoUrl}`, photoErr)
                            // Add a note about the failed photo
                            entryFolder.file(`photo_${j + 1}_FAILED.txt`, `Failed to download: ${photoUrl}`)
                        }
                    }
                }
            }

            setProgress('Generating ZIP file...')
            const blob = await zip.generateAsync({ type: 'blob' })

            // Trigger download
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `R-dyri-diary-export-${new Date().toISOString().split('T')[0]}.zip`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            setProgress(`Done! ${totalEntries} entries, ${photoCount} photos exported.`)
            setTimeout(() => setProgress(''), 3000)
        } catch (err) {
            console.error('Export failed:', err)
            alert('Failed to export diary. Please try again.')
            setProgress('')
        } finally {
            setExporting(false)
        }
    }

    return (
        <div className="flex flex-col gap-1">
            <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center justify-between w-full px-4 py-3 bg-card border border-border rounded-xl hover:bg-muted transition-colors disabled:opacity-60"
            >
                <span className="text-sm font-medium text-foreground">
                    Export Diary
                </span>
                <div className="flex items-center gap-2 text-muted-foreground">
                    {exporting ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <Download size={18} />
                    )}
                </div>
            </button>
            {progress && (
                <p className="text-[11px] text-muted-foreground px-2 animate-pulse">
                    {progress}
                </p>
            )}
        </div>
    )
}
