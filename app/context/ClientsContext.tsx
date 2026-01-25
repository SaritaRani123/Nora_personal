'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Client } from '@/types/client';

type ClientsContextValue = {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  addClient: (c: Client) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
};

const ClientsContext = createContext<ClientsContextValue | null>(null);

export function ClientsProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);

  const addClient = useCallback((c: Client) => {
    setClients((prev) => [...prev, c]);
  }, []);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const getClientById = useCallback(
    (id: string) => {
      return clients.find((c) => c.id === id);
    },
    [clients]
  );

  return (
    <ClientsContext.Provider
      value={{
        clients,
        setClients,
        addClient,
        updateClient,
        deleteClient,
        getClientById,
      }}
    >
      {children}
    </ClientsContext.Provider>
  );
}

export function useClients() {
  const ctx = useContext(ClientsContext);
  if (!ctx) throw new Error('useClients must be used within ClientsProvider');
  return ctx;
}
