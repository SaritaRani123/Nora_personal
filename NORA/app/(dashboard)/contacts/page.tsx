'use client'

import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import useSWR from 'swr'
import {
  listContacts,
  createContact,
  updateContact,
  deleteContact,
  type Contact,
} from '@/lib/services/contacts'
import { useToast } from '@/hooks/use-toast'

function sortAlphabetically<T extends { name?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) =>
    (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase())
  )
}

export default function ContactsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null)
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: contacts = [], mutate: mutateContacts } = useSWR<Contact[]>('contacts', listContacts)

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return sortAlphabetically(contacts)
    const q = searchQuery.toLowerCase()
    return sortAlphabetically(
      contacts.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q) ||
          c.address?.toLowerCase().includes(q)
      )
    )
  }, [contacts, searchQuery])

  const resetForm = () => {
    setFormName('')
    setFormEmail('')
    setFormPhone('')
    setFormAddress('')
    setEditingContact(null)
  }

  const openCreate = () => {
    resetForm()
    setIsCreateOpen(true)
  }

  const openEdit = (contact: Contact) => {
    setEditingContact(contact)
    setFormName(contact.name)
    setFormEmail(contact.email)
    setFormPhone(contact.phone ?? '')
    setFormAddress(contact.address ?? '')
  }

  const handleCreate = async () => {
    if (!formName.trim()) {
      toast({ title: 'Name required', variant: 'destructive' })
      return
    }
    setIsSubmitting(true)
    try {
      await createContact({
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || undefined,
        address: formAddress.trim() || undefined,
      })
      await mutateContacts()
      setIsCreateOpen(false)
      resetForm()
      toast({ title: 'Contact created' })
    } catch {
      toast({ title: 'Failed to create contact', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingContact || !formName.trim()) return
    setIsSubmitting(true)
    try {
      await updateContact(editingContact.id, {
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || undefined,
        address: formAddress.trim() || undefined,
      })
      await mutateContacts()
      setEditingContact(null)
      resetForm()
      toast({ title: 'Contact updated' })
    } catch {
      toast({ title: 'Failed to update contact', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!contactToDelete) return
    try {
      await deleteContact(contactToDelete.id)
      await mutateContacts()
      setContactToDelete(null)
      toast({ title: 'Contact deleted' })
    } catch {
      toast({ title: 'Failed to delete contact', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
        <p className="text-muted-foreground">Manage your clients and contacts.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Contacts
            </CardTitle>
            <CardDescription>{filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Users className="mb-3 h-12 w-12 opacity-50" />
              <p>{searchQuery ? 'No contacts match your search.' : 'No contacts yet. Add one to get started.'}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="hidden md:table-cell">Address</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>
                      {contact.email ? (
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          {contact.email}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {contact.phone ? (
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          {contact.phone}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden max-w-[200px] truncate md:table-cell">
                      {contact.address ? (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          {contact.address}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(contact)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setContactToDelete(contact)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="create-name">Name *</Label>
              <Input
                id="create-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Contact name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-phone">Phone</Label>
              <Input
                id="create-phone"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-address">Address</Label>
              <Input
                id="create-address"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="Address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editingContact} onOpenChange={(open) => !open && setEditingContact(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Contact name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="Address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingContact(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!contactToDelete} onOpenChange={(open) => !open && setContactToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete contact?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {contactToDelete?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
