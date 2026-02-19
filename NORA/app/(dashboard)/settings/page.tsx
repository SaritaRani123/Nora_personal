'use client'

import { useState, useEffect, useRef } from 'react'
import { User, Bell, Shield, Save } from 'lucide-react'
import { useUser } from '@/lib/contexts/UserContext'
import { getUserInitials } from '@/lib/services/user'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

const AVATAR_ACCEPT = 'image/png,image/jpeg,image/jpg,image/gif'
const AVATAR_MAX_BYTES = 2 * 1024 * 1024 // 2MB
const AVATAR_STORAGE_KEY = 'nora_avatar'

export default function SettingsPage() {
  const { user, updateUser } = useUser()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
  })

  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(AVATAR_STORAGE_KEY) : null
      if (stored) setAvatar(stored)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
    })
  }, [user.firstName, user.lastName, user.email, user.phone])

  const handleSaveProfile = () => {
    updateUser(form)
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast({ title: 'Only JPG/PNG/GIF allowed', variant: 'destructive' })
      return
    }
    if (file.size > AVATAR_MAX_BYTES) {
      toast({ title: 'Max 2MB', variant: 'destructive' })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      try {
        localStorage.setItem(AVATAR_STORAGE_KEY, result)
        setAvatar(result)
        toast({ title: 'Avatar updated' })
      } catch {
        toast({ title: 'Failed to save avatar', variant: 'destructive' })
      }
    }
    reader.readAsDataURL(file)
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <Card className="bg-card border-border lg:w-64 shrink-0">
          <CardContent className="p-2">
            <nav className="flex flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-left ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        <div className="flex-1 space-y-6">
          {activeTab === 'profile' && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      getUserInitials(user)
                    )}
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={AVATAR_ACCEPT}
                      className="hidden"
                      aria-hidden
                      onChange={handleAvatarChange}
                    />
                    <Button type="button" variant="outline" size="sm" className="bg-transparent" onClick={handleAvatarClick}>
                      Change Avatar
                    </Button>
                    <p className="mt-1 text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} className="bg-secondary/50 border-0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} className="bg-secondary/50 border-0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="bg-secondary/50 border-0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="bg-secondary/50 border-0" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSaveProfile}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive weekly expense summaries</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Budget Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified when approaching budget limits</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Statement Processing</p>
                    <p className="text-sm text-muted-foreground">Notify when bank statements are processed</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Monthly Reports</p>
                    <p className="text-sm text-muted-foreground">Auto-generate and send monthly reports</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Change Password</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" className="bg-secondary/50 border-0" />
                    </div>
                    <div />
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" className="bg-secondary/50 border-0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" className="bg-secondary/50 border-0" />
                    </div>
                  </div>
                  <Button variant="outline" className="bg-transparent">Update Password</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" className="bg-transparent">Enable 2FA</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-destructive">Delete Account</p>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and data</p>
                  </div>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
