'use client'

import { Trash2 } from 'lucide-react'
import { useState } from 'react'
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

export default function DeleteChatButton({ action }: { action: () => Promise<{ success: boolean; error?: string; message?: string }> }) {
    const [loading, setLoading] = useState(false)

    const handleConfirm = async () => {
        setLoading(true)
        try {
            const result = await action()
            if (!result.success) {
                alert(result.error || 'Failed to delete messages.')
            }
        } catch (error) {
            console.error(error)
            alert('An unexpected error occurred.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <button
                    disabled={loading}
                    className="h-9 w-full flex items-center justify-center gap-2 bg-transparent border border-destructive/20 text-destructive rounded-xl text-[13px] font-medium hover:bg-destructive/5 transition-colors disabled:opacity-50"
                >
                    <Trash2 size={16} />
                    {loading ? 'Deleting...' : 'Delete All Chat'}
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete all messages?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete all chat messages between you and your partner. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        Yes, delete all
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
