'use client'

import { useDiaryFont } from '@/lib/diary-font'

export function EntryContent({ title, content, fallbackTitle }: {
    title: string | null
    content: string
    fallbackTitle: string
}) {
    const { fontFamily } = useDiaryFont()

    return (
        <>
            <h1
                className="text-3xl md:text-4xl text-foreground tracking-tight leading-tight"
                style={{ fontFamily }}
            >
                {title || fallbackTitle}
            </h1>
            <div
                className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-[1.15rem] md:text-[1.3rem] mt-8"
                style={{ fontFamily, lineHeight: '1.8' }}
            >
                {content}
            </div>
        </>
    )
}
