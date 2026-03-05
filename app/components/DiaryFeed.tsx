'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, ChevronDown, ImageIcon } from 'lucide-react'
import { format, getWeekOfMonth } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from '@/lib/supabase/client'

type DiaryEntry = {
    id: string
    user_id: string
    title: string | null
    content: string
    photos: string[]
    created_at: string
    logical_date: string
    reactions?: { emoji: string; user_id: string }[]
}

type Tab = 'together' | 'mine' | 'partner'

const stripHtml = (html: string) => html ? html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim() : ''

const PAGE_SIZE = 20

const MONTHS = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
]

const WEEKS = [
    { value: '1', label: 'Week 1' },
    { value: '2', label: 'Week 2' },
    { value: '3', label: 'Week 3' },
    { value: '4', label: 'Week 4' },
    { value: '5', label: 'Week 5' },
    { value: '6', label: 'Week 6' },
]

export default function DiaryFeed({
    currentUserId,
    partnerName,
    partnerAvatarUrl,
    currentUserAvatarUrl,
}: {
    currentUserId: string
    partnerName: string
    partnerAvatarUrl: string | null
    currentUserAvatarUrl: string | null
}) {
    const [entries, setEntries] = useState<DiaryEntry[] | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchEntries = async () => {
        setIsLoading(true)
        const supabase = createClient()
        const { data } = await supabase
            .from('diaries')
            .select('*, reactions(emoji, user_id)')
            .order('logical_date', { ascending: false })
            .order('created_at', { ascending: false })
        setEntries(data as DiaryEntry[] | null)
        setIsLoading(false)
    }

    useEffect(() => {
        fetchEntries()
    }, [])

    const [activeTab, setActiveTab] = useState<Tab>('together')
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

    const [selectedYear, setSelectedYear] = useState<string>(() => format(new Date(), 'yyyy'))
    const [selectedMonth, setSelectedMonth] = useState<string>(() => format(new Date(), 'M'))
    const [selectedWeek, setSelectedWeek] = useState<string>(() => getWeekOfMonth(new Date()).toString())

    // Reset pagination when any filter changes
    useEffect(() => {
        setVisibleCount(PAGE_SIZE)
    }, [activeTab, selectedYear, selectedMonth, selectedWeek])

    const availableYears = useMemo(() => {
        const years = new Set<string>()
        years.add(format(new Date(), 'yyyy'))
        if (entries) {
            entries.forEach(e => years.add(format(new Date(e.logical_date || e.created_at), 'yyyy')))
        }
        return Array.from(years).sort((a, b) => b.localeCompare(a))
    }, [entries])

    // Filter + sort
    const sortedEntries = useMemo(() => {
        const filtered = entries?.filter((entry) => {
            // Tab filter
            if (activeTab === 'mine' && entry.user_id !== currentUserId) return false
            if (activeTab === 'partner' && entry.user_id === currentUserId) return false

            // Time filters
            const dateObj = new Date(entry.logical_date || entry.created_at)

            if (selectedYear !== 'all' && format(dateObj, 'yyyy') !== selectedYear) return false
            if (selectedMonth !== 'all' && format(dateObj, 'M') !== selectedMonth) return false
            if (selectedWeek !== 'all' && getWeekOfMonth(dateObj).toString() !== selectedWeek) return false

            return true
        }) || []

        return [...filtered].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
    }, [entries, activeTab, currentUserId, selectedYear, selectedMonth, selectedWeek])

    // Paginate
    const visibleEntries = sortedEntries.slice(0, visibleCount)
    const hasMore = visibleCount < sortedEntries.length
    const remaining = sortedEntries.length - visibleCount

    // Group visible entries by month -> date
    const groupedEntries = useMemo(() => {
        return visibleEntries.reduce((acc, entry) => {
            const dateObj = new Date(entry.logical_date || entry.created_at)
            const monthYear = format(dateObj, 'MMMM yyyy')
            const dateKey = format(dateObj, 'yyyy-MM-dd')

            if (!acc[monthYear]) acc[monthYear] = {}
            if (!acc[monthYear][dateKey]) acc[monthYear][dateKey] = []

            acc[monthYear][dateKey].push(entry)
            return acc
        }, {} as Record<string, Record<string, DiaryEntry[]>>)
    }, [visibleEntries])

    const tabs: { key: Tab; label: string; count: number }[] = [
        { key: 'together', label: 'All', count: entries?.length || 0 },
        { key: 'mine', label: 'Mine', count: entries?.filter(e => e.user_id === currentUserId).length || 0 },
        { key: 'partner', label: partnerName, count: entries?.filter(e => e.user_id !== currentUserId).length || 0 },
    ]

    return (
        <div className="flex-1 w-full relative">
            {/* Sticky Header Container for Tabs + Filters */}
            <div className="sticky top-0 bg-background/95 backdrop-blur-md z-20 pt-2 pb-4 border-b border-border/50 mb-6 -mt-2">
                {/* Tab Bar */}
                <div className="flex gap-1 bg-muted rounded-xl p-1 mb-3">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`
                                flex-1 py-1.5 md:py-2 px-3 rounded-lg text-[12px] font-medium tracking-wide transition-all duration-300 flex items-center justify-center gap-1.5
                                ${activeTab === tab.key
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }
                            `}
                        >
                            {tab.label}
                            <span className={`text-[10px] ${activeTab === tab.key ? 'text-muted-foreground' : 'opacity-70'}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Filter Bar */}
                <div className="grid grid-cols-3 gap-2">
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-full bg-card border-border shadow-sm h-9 md:h-10 text-[11px] md:text-sm rounded-xl">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                            <SelectItem value="all">All Years</SelectItem>
                            {availableYears.map(year => (
                                <SelectItem key={year} value={year}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-full bg-card border-border shadow-sm h-9 md:h-10 text-[11px] md:text-sm rounded-xl">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                            <SelectItem value="all">All Months</SelectItem>
                            {MONTHS.map(m => (
                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                        <SelectTrigger className="w-full bg-card border-border shadow-sm h-9 md:h-10 text-[11px] md:text-sm rounded-xl">
                            <SelectValue placeholder="Week" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                            <SelectItem value="all">All Weeks</SelectItem>
                            {WEEKS.map(w => (
                                <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>



            {/* Entries */}
            {/* Render Feed */}
            {isLoading && !entries ? (
                <div className="flex justify-center items-center py-20 opacity-50">
                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
            ) : visibleEntries.length === 0 ? (
                <div className="text-center py-20 px-4 animate-in fade-in duration-700">
                    <p className="text-muted-foreground font-sans tracking-wide">
                        {activeTab === 'together'
                            ? "No entries match your filters yet."
                            : activeTab === 'mine'
                                ? "You don't have any matching entries."
                                : `${partnerName} hasn't written any matching entries.`}
                    </p>
                    {activeTab !== 'partner' && (
                        <Link
                            href="/write"
                            className="text-sm font-sans tracking-wide border-b border-border hover:text-foreground transition-all pb-0.5 mt-4 inline-block"
                        >
                            Write your first entry
                        </Link>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-10">
                    {Object.entries(groupedEntries).map(([monthYear, daysObj]) => (
                        <section key={monthYear}>
                            <h2 className="text-[10px] uppercase tracking-widest text-muted-foreground font-sans mb-4 border-b border-border pb-2 sticky top-0 bg-background/80 backdrop-blur-md z-10 pt-3">
                                {monthYear}
                            </h2>
                            <div className="flex flex-col gap-8">
                                {Object.entries(daysObj).map(([dateKey, dayEntries]) => {
                                    // Make sure date parses in local timezone roughly
                                    const dayDate = new Date(dateKey + 'T12:00:00')
                                    return (
                                        <div key={dateKey} className="flex flex-col gap-3">
                                            <h3 className="text-[11px] font-sans text-muted-foreground font-medium ml-1 flex items-center gap-2">
                                                <span>{format(dayDate, 'EEEE')}</span>
                                                <span className="text-border">•</span>
                                                <span>{format(dayDate, 'MMM d')}</span>
                                            </h3>

                                            {/* Daily entry wrapper to visually group You & Partner */}
                                            <div className={`relative ${activeTab === 'together' ? 'bg-muted/30 border border-border/60 rounded-2xl p-1.5 md:p-2 mb-2 shadow-sm' : ''}`}>

                                                {(activeTab === 'together') && (
                                                    <div className="absolute left-1/2 top-8 bottom-8 w-[1.5px] bg-border/50 -translate-x-1/2 z-0" />
                                                )}



                                                {/* Column-wise grid pairing 'You' and 'Partner' side-by-side */}
                                                <div className={`grid grid-cols-2 ${activeTab === 'together' ? 'gap-1.5 md:gap-2' : 'gap-2 md:gap-3'} relative z-10`}>

                                                    {[
                                                        { isMe: true, entry: dayEntries.find(e => e.user_id === currentUserId) },
                                                        { isMe: false, entry: dayEntries.find(e => e.user_id !== currentUserId) }
                                                    ].map(({ isMe, entry }, index) => {
                                                        const avatarUrl = isMe ? currentUserAvatarUrl : partnerAvatarUrl
                                                        const displayName = isMe ? 'You' : partnerName

                                                        // If we are filtering by 'mine' or 'partner' tab, don't show the other's empty states
                                                        if (!entry && activeTab !== 'together') return null

                                                        if (!entry) {
                                                            return (
                                                                <div
                                                                    key={`empty-${isMe}`}
                                                                    className={`
                                                                    rounded-xl px-3 py-6 md:px-4 md:py-8 border-2 border-dashed border-border/50 bg-background/50 flex flex-col items-center justify-center text-center gap-2 opacity-70
                                                                    animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both w-full h-full min-h-[140px]
                                                                `}
                                                                    style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
                                                                >
                                                                    <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-muted-foreground border border-border">
                                                                        <span className="text-[10px] md:text-xs uppercase font-bold text-foreground/80">{displayName.charAt(0)}</span>
                                                                    </div>
                                                                    <span className="text-[10px] md:text-[11px] text-muted-foreground font-sans tracking-wide">
                                                                        {isMe ? 'Write your entry' : 'Waiting for entry'}
                                                                    </span>
                                                                </div>
                                                            )
                                                        }

                                                        return (
                                                            <Link
                                                                href={`/entry/${entry.id}`}
                                                                key={entry.id}
                                                                className="group block animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both relative z-10"
                                                                style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
                                                            >
                                                                <article
                                                                    className={`
                                                                    rounded-xl px-3 py-3 md:px-4 md:py-3 transition-all duration-300 ease-out cursor-pointer h-full flex flex-col justify-between
                                                                    hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]
                                                                    ${isMe
                                                                            ? 'bg-card border border-border hover:border-border/80 hover:shadow-md'
                                                                            : 'bg-primary/5 dark:bg-primary/10 border border-primary/20 hover:border-primary/40 hover:shadow-md'
                                                                        }
                                                                `}
                                                                >
                                                                    <div className="flex-1 flex flex-col gap-3 min-w-0">
                                                                        {/* Header: DP / Avatar + Time/Reactions */}
                                                                        <div className="flex justify-between items-start">
                                                                            <div className="shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-muted overflow-hidden flex items-center justify-center border border-border/50">
                                                                                {avatarUrl ? (
                                                                                    <img src={avatarUrl} alt="DP" className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    <span className="text-[13px] md:text-[15px] font-medium font-serif text-muted-foreground">
                                                                                        {displayName.charAt(0).toUpperCase()}
                                                                                    </span>
                                                                                )}
                                                                            </div>

                                                                            <div className="flex flex-col items-end gap-1">
                                                                                <span className="text-[9px] md:text-[10px] text-muted-foreground font-sans tracking-wide whitespace-nowrap">
                                                                                    {format(new Date(entry.created_at), 'h:mm a')}
                                                                                </span>
                                                                                {entry.reactions && entry.reactions.length > 0 && (
                                                                                    <div className="flex items-center gap-0.5 mt-0.5">
                                                                                        {[...new Set(entry.reactions.map(r => r.emoji))].slice(0, 3).map(emoji => (
                                                                                            <span key={emoji} className="text-[12px] md:text-[14px] leading-none drop-shadow-sm">{emoji}</span>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {/* Body preview */}
                                                                        <p className="text-muted-foreground font-sans text-xs md:text-sm line-clamp-3 md:line-clamp-4 leading-relaxed mt-1">
                                                                            {stripHtml(entry.content)}
                                                                        </p>
                                                                    </div>

                                                                    {/* Footer: Title and specific meta */}
                                                                    <div className="flex items-center justify-between gap-2 min-w-0 mt-3 pt-3 border-t border-border/60">
                                                                        {entry.title ? (
                                                                            <span className="font-serif text-[12px] md:text-[14px] text-foreground truncate font-medium">
                                                                                {entry.title}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="font-serif text-[11px] md:text-[13px] text-muted-foreground italic truncate">
                                                                                {isMe ? 'Untitled Entry' : `${partnerName}'s Entry`}
                                                                            </span>
                                                                        )}

                                                                        {entry.photos && entry.photos.length > 0 && (
                                                                            <div className="flex items-center gap-1 text-[9px] md:text-[10px] text-muted-foreground shrink-0 bg-muted px-1.5 py-0.5 rounded border border-border">
                                                                                <ImageIcon size={10} />
                                                                                {entry.photos.length}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </article>
                                                            </Link>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    ))}

                    {/* Load More */}
                    {hasMore && (
                        <button
                            onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                            className="mx-auto flex items-center gap-2 text-[13px] font-medium text-muted-foreground hover:text-foreground border border-border hover:border-border/80 rounded-full px-6 py-2.5 transition-all hover:shadow-sm"
                        >
                            <ChevronDown size={14} />
                            Load more ({remaining > PAGE_SIZE ? PAGE_SIZE : remaining} of {remaining} remaining)
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
