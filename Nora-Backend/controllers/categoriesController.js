import { categories } from '../data/mockData.js';

export const getCategories = (req, res) => {
  try {
    // Return in array format
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
