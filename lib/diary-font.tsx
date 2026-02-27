'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type DiaryFont = 'handwritten' | 'serif' | 'sans'

const STORAGE_KEY = 'rdyri-diary-font'
const DEFAULT_FONT: DiaryFont = 'handwritten'

const fontFamilyMap: Record<DiaryFont, string> = {
    handwritten: 'var(--font-caveat), cursive',
    serif: 'var(--font-lora), Georgia, serif',
    sans: 'var(--font-inter), system-ui, sans-serif',
}

const DiaryFontContext = createContext<{
    font: DiaryFont
    setFont: (f: DiaryFont) => void
    fontFamily: string
}>({
    font: DEFAULT_FONT,
    setFont: () => { },
    fontFamily: fontFamilyMap[DEFAULT_FONT],
})

export function DiaryFontProvider({ children }: { children: React.ReactNode }) {
    const [font, setFontState] = useState<DiaryFont>(DEFAULT_FONT)

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY) as DiaryFont | null
        if (saved && fontFamilyMap[saved]) {
            setFontState(saved)
        }
    }, [])

    const setFont = (f: DiaryFont) => {
        setFontState(f)
        localStorage.setItem(STORAGE_KEY, f)
    }

    return (
        <DiaryFontContext.Provider value={{ font, setFont, fontFamily: fontFamilyMap[font] }}>
            {children}
        </DiaryFontContext.Provider>
    )
}

export function useDiaryFont() {
    return useContext(DiaryFontContext)
}

export { fontFamilyMap }
