import { paymentMethods, expenseStatusOptions, appConfig } from '../data/mockData.js';

export const getConfig = (req, res) => {
  try {
    res.json({
      paymentMethods,
      expenseStatusOptions,
      ...appConfig,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
