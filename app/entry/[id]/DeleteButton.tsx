'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteEntry } from './actions'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function DeleteButton({ entryId }: { entryId: string }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
        // Prevent dialog from closing immediately so we can show loading state
        e.preventDefault()

        setIsDeleting(true)
        const result = await deleteEntry(entryId)

        if (result.success) {
            setIsOpen(false)
            router.refresh()
            router.push('/')
        } else {
            alert(result.error || 'Failed to delete entry.')
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <button
                    disabled={isDeleting}
                    className="flex items-center justify-center p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors group"
                    title="Delete entry"
                >
                    {isDeleting ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Trash2 size={16} />
                    )}
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your diary entry.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="inline-flex h-10 items-center justify-center rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                    >
                        {isDeleting ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                        Delete
                    </button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
