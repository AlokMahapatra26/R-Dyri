'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ImageGallery({ photos }: { photos: string[] }) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    if (!photos || photos.length === 0) return null

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (selectedIndex !== null && selectedIndex < photos.length - 1) {
            setSelectedIndex(selectedIndex + 1)
        }
    }

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (selectedIndex !== null && selectedIndex > 0) {
            setSelectedIndex(selectedIndex - 1)
        }
    }

    return (
        <div className="mt-8 pt-8 border-t border-border">
            {/* Thumbnail Grid */}
            <div className={`grid gap-4 ${photos.length > 1 ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-2'}`}>
                {photos.map((photoUrl: string, i: number) => (
                    <div
                        key={i}
                        onClick={() => setSelectedIndex(i)}
                        className="w-full relative aspect-square rounded-xl overflow-hidden bg-muted cursor-pointer shadow-sm hover:opacity-95 transition-all duration-300 ease-out hover:scale-[1.03] active:scale-[0.97] border border-border hover:border-border/80 hover:shadow-md"
                    >
                        <Image
                            src={photoUrl}
                            alt={`Attachment ${i + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 33vw"
                        />
                    </div>
                ))}
            </div>

            {/* Lightbox / Modal */}
            {selectedIndex !== null && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 sm:p-8 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-300 ease-out"
                    onClick={() => setSelectedIndex(null)}
                >
                    {/* Close Button */}
                    <button
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
                        onClick={(e) => {
                            e.stopPropagation()
                            setSelectedIndex(null)
                        }}
                    >
                        <X size={24} />
                    </button>

                    {/* Navigation Buttons (if multiple images) */}
                    {photos.length > 1 && (
                        <>
                            <button
                                className={`absolute left-4 sm:left-8 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50 ${selectedIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={handlePrev}
                                disabled={selectedIndex === 0}
                            >
                                <ChevronLeft size={32} strokeWidth={1.5} />
                            </button>
                            <button
                                className={`absolute right-4 sm:right-8 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50 ${selectedIndex === photos.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={handleNext}
                                disabled={selectedIndex === photos.length - 1}
                            >
                                <ChevronRight size={32} strokeWidth={1.5} />
                            </button>
                        </>
                    )}

                    {/* Main Image Container */}
                    <div className="relative w-full h-[85vh] flex items-center justify-center max-w-5xl" onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={photos[selectedIndex]}
                            alt={`Fullscreen Attachment ${selectedIndex + 1}`}
                            fill
                            className="object-contain"
                            quality={100}
                            sizes="100vw"
                        />

                        {/* Image Counter */}
                        {photos.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-sm font-medium tracking-wide">
                                {selectedIndex + 1} / {photos.length}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
