import { contacts } from '../data/mockData.js';

// In-memory store (replace with database in production)
let contactsStore = [...contacts];

export const getContacts = (req, res) => {
  try {
    res.json({ contacts: contactsStore });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createContact = (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const newContact = {
      id: `c-${Date.now()}`,
      name: name || '',
      email: email || '',
      phone: phone || '',
      address: address || '',
    };
    contactsStore.unshift(newContact);
    res.status(201).json({ contacts: [newContact] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateContact = (req, res) => {
  try {
    const { id, ...updates } = req.body;
    const index = contactsStore.findIndex((c) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    contactsStore[index] = { ...contactsStore[index], ...updates };
    res.json({ contacts: [contactsStore[index]] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteContact = (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({ error: 'Missing id' });
    }
    const removed = contactsStore.find((c) => c.id === id);
    if (!removed) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    contactsStore = contactsStore.filter((c) => c.id !== id);
    res.json({ contacts: [removed] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
