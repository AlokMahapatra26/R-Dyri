'use client'

import { useEffect, useState } from 'react'
import { Type } from 'lucide-react'
import { useDiaryFont, type DiaryFont, fontFamilyMap } from '@/lib/diary-font'

const FONT_OPTIONS: { value: DiaryFont; label: string; preview: string }[] = [
    { value: 'handwritten', label: 'Handwritten', preview: 'Aa' },
    { value: 'serif', label: 'Serif', preview: 'Aa' },
    { value: 'sans', label: 'Sans-serif', preview: 'Aa' },
]

const FONT_LABELS: Record<DiaryFont, string> = {
    handwritten: 'Handwritten',
    serif: 'Serif',
    sans: 'Sans-serif',
}

export function FontPicker() {
    const { font, setFont } = useDiaryFont()
    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button className="flex items-center justify-between w-full px-4 py-3 bg-card border border-border rounded-xl transition-colors">
                <span className="text-sm font-medium text-foreground">Diary Font</span>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Type size={18} />
                </div>
            </button>
        )
    }

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center justify-between w-full px-4 py-3 bg-card border border-border rounded-xl hover:bg-muted transition-colors"
            >
                <span className="text-sm font-medium text-foreground">Diary Font</span>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-xs uppercase tracking-wider font-semibold">
                        {FONT_LABELS[font]}
                    </span>
                    <Type size={18} />
                </div>
            </button>

            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-20">
                    {FONT_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => {
                                setFont(opt.value)
                                setOpen(false)
                            }}
                            className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-muted transition-colors ${font === opt.value ? 'text-primary' : 'text-foreground'}`}
                        >
                            <span className="font-medium">{opt.label}</span>
                            <span
                                className="text-lg"
                                style={{ fontFamily: fontFamilyMap[opt.value] }}
                            >
                                {opt.preview}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
