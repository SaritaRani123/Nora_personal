import { paymentMethods, appConfig } from '../data/mockData.js';

/**
 * GET /payment-methods
 * Returns payment methods list and default id for expense forms and filters.
 */
export const getPaymentMethods = (req, res) => {
  try {
    res.json({
      paymentMethods,
      defaultPaymentMethodId: appConfig.defaultPaymentMethodId ?? (paymentMethods[0]?.id ?? ''),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
