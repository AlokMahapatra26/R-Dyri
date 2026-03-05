'use client'

import { useState, useRef } from 'react'
import { updateProfile } from './actions'
import { Loader2, Camera, User, Check } from 'lucide-react'
import Image from 'next/image'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ProfileData = {
    name: string | null
    dob: string | null
    gender: string | null
    avatar_url: string | null
}

export default function ProfileForm({
    initialData,
    email,
}: {
    initialData: ProfileData | null
    email: string | undefined
}) {
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.avatar_url || null)
    const [avatarBase64, setAvatarBase64] = useState<string>('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Create preview URL
        const objectUrl = URL.createObjectURL(file)
        setPreviewUrl(objectUrl)

        // Convert to base64 for submission
        const reader = new FileReader()
        reader.onloadend = () => {
            const base64String = reader.result as string
            setAvatarBase64(base64String)
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSaving(true)

        try {
            const formData = new FormData(e.currentTarget)
            if (avatarBase64) {
                formData.append('avatarBase64', avatarBase64)
            }
            await updateProfile(formData)
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch (error) {
            console.error(error)
            alert('Failed to save profile.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-4 border border-border shadow-sm flex flex-col items-center">

            {/* Avatar Upload */}
            <div className="relative mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-16 h-16 rounded-full overflow-hidden bg-muted border-2 border-background shadow-md flex items-center justify-center relative">
                    {previewUrl ? (
                        <Image src={previewUrl} alt="Avatar" width={64} height={64} className="w-full h-full object-cover" />
                    ) : (
                        <User size={24} className="text-muted-foreground" />
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera size={20} className="text-white" />
                    </div>
                </div>
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                />
            </div>

            <div className="w-full space-y-3">
                {/* Email (Read Only) */}
                <div>
                    <Label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1 ml-1">Account</Label>
                    <Input
                        type="email"
                        disabled
                        value={email || ''}
                        className="bg-muted border-transparent text-muted-foreground rounded-xl h-10 text-[13px]"
                    />
                </div>

                {/* Name */}
                <div>
                    <Label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1 ml-1">Display Name</Label>
                    <Input
                        type="text"
                        name="name"
                        defaultValue={initialData?.name || ''}
                        placeholder="What should your partner call you?"
                        className="bg-background border-border rounded-xl h-10 text-[13px]"
                    />
                </div>

                {/* DOB & Gender Row */}
                <div className="flex gap-3">
                    <div className="flex-1">
                        <Label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1 ml-1">Date of Birth</Label>
                        <Input
                            type="date"
                            name="dob"
                            defaultValue={initialData?.dob || ''}
                            className="bg-background border-border rounded-xl h-10 text-[13px]"
                        />
                    </div>
                    <div className="flex-[2]">
                        <Label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1 ml-1">Gender</Label>
                        <Select name="gender" defaultValue={initialData?.gender || undefined}>
                            <SelectTrigger className="w-full bg-background border-border rounded-xl h-10 text-[13px]">
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="non-binary">Non-binary</SelectItem>
                                <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                disabled={saving || saved}
                className={`w-full mt-6 rounded-xl h-10 text-[14px] transition-colors disabled:opacity-50 ${saved ? 'bg-green-600/90 hover:bg-green-600/90 text-white border-none' : ''}`}
            >
                {saving ? (
                    <>
                        <Loader2 className="animate-spin mr-2" size={18} />
                        Saving...
                    </>
                ) : saved ? (
                    <>
                        <Check className="mr-2" size={18} />
                        Saved
                    </>
                ) : (
                    'Save Profile'
                )}
            </Button>
        </form>
    )
}
