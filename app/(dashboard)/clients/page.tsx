'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, X, Users, Mail, Phone, Building } from 'lucide-react';
import { useClients } from '@/app/context/ClientsContext';
import Modal from '@/ui/Modal';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@/ui/Table';
import type { Client } from '@/types/client';

export default function ClientsPage() {
  const clients = useClients();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formTaxId, setFormTaxId] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const filteredClients = useMemo(() => {
    return clients.clients.filter((client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clients.clients, searchQuery]);

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormAddress('');
    setFormCompany('');
    setFormTaxId('');
    setFormNotes('');
  };

  const handleAdd = () => {
    resetForm();
    setEditingClient(null);
    setShowAddModal(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormName(client.name);
    setFormEmail(client.email || '');
    setFormPhone(client.phone || '');
    setFormAddress(client.address || '');
    setFormCompany(client.company || '');
    setFormTaxId(client.taxId || '');
    setFormNotes(client.notes || '');
    setShowEditModal(true);
  };

  const handleDelete = (client: Client) => {
    if (confirm(`Delete client "${client.name}"? This action cannot be undone.`)) {
      clients.deleteClient(client.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Client name is required');
      return;
    }

    const clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formName.trim(),
      email: formEmail.trim() || undefined,
      phone: formPhone.trim() || undefined,
      address: formAddress.trim() || undefined,
      company: formCompany.trim() || undefined,
      taxId: formTaxId.trim() || undefined,
      notes: formNotes.trim() || undefined,
    };

    if (editingClient) {
      clients.updateClient(editingClient.id, {
        ...clientData,
        updatedAt: new Date().toISOString(),
      });
      setShowEditModal(false);
    } else {
      const newClient: Client = {
        id: `client-${Date.now()}`,
        ...clientData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      clients.addClient(newClient);
      setShowAddModal(false);
    }
    resetForm();
    setEditingClient(null);
  };

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Clients</h1>
          <p className="text-sm text-gray-500">Manage your client contacts</p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{clients.clients.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-info-subtle rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-info" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">With Email</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {clients.clients.filter((c) => c.email).length}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-success-subtle rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Companies</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {clients.clients.filter((c) => c.company).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card overflow-hidden">
        {/* Filters */}
        <div className="p-5 bg-gray-50/50 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
            <TableHeaderCell>Phone</TableHeaderCell>
            <TableHeaderCell>Company</TableHeaderCell>
            <TableHeaderCell align="right">Actions</TableHeaderCell>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow hover={false}>
                <TableCell colSpan={5} className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 font-medium">
                    {searchQuery ? 'No clients match your search.' : 'No clients yet.'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {searchQuery ? 'Try a different search term.' : 'Add your first client to get started.'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="font-semibold text-gray-900">{client.name}</div>
                    {client.address && (
                      <div className="text-xs text-gray-500 mt-0.5">{client.address}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {client.email ? (
                      <a
                        href={`mailto:${client.email}`}
                        className="text-gray-700 hover:text-primary-600 transition-colors"
                      >
                        {client.email}
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {client.phone ? (
                      <a
                        href={`tel:${client.phone}`}
                        className="text-gray-700 hover:text-primary-600 transition-colors"
                      >
                        {client.phone}
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {client.company ? (
                      <span className="text-gray-700">{client.company}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(client)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(client)}
                        className="p-2 text-gray-400 hover:text-danger hover:bg-danger-subtle rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          setEditingClient(null);
          resetForm();
        }}
        title={editingClient ? 'Edit Client' : 'Add Client'}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                setEditingClient(null);
                resetForm();
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="client-form"
              className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium shadow-sm transition-all"
            >
              {editingClient ? 'Save Changes' : 'Add Client'}
            </button>
          </>
        }
      >
        <form id="client-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
              <input
                type="text"
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tax ID</label>
              <input
                type="text"
                value={formTaxId}
                onChange={(e) => setFormTaxId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white resize-none"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
