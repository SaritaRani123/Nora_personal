import { budget } from '../data/mockData.js';

export const getBudget = (req, res) => {
  try {
    // Return in array format
    res.json({ budget });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
