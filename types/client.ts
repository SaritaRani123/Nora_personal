export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  taxId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
