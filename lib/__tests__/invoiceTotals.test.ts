import { describe, it, expect } from '@jest/globals';
import { computeInvoiceTotals } from '../invoiceTotals';
import type { Invoice } from '@/types/invoice';

describe('computeInvoiceTotals', () => {
  const baseInvoice: Invoice = {
    id: 'test-1',
    invoiceNumber: 'INV-2024-001',
    clientName: 'Test Client',
    amount: 0,
    status: 'draft',
    issueDate: '2024-01-01',
    dueDate: '2024-01-15',
    lineItems: [
      { description: 'Item 1', amount: 100, quantity: 1, unitPrice: 100 },
      { description: 'Item 2', amount: 200, quantity: 2, unitPrice: 100 },
    ],
  };

  it('should calculate subtotal correctly with no discount or late fee', () => {
    const totals = computeInvoiceTotals(baseInvoice);
    
    expect(totals.subtotal).toBe(300); // 100 + 200
    expect(totals.discountAmount).toBe(0);
    expect(totals.taxTotal).toBe(0);
    expect(totals.lateFeeAccrued).toBe(0);
    expect(totals.grandTotal).toBe(300);
  });

  it('should calculate discount correctly when enabled', () => {
    const invoice: Invoice = {
      ...baseInvoice,
      discountEnabled: true,
      discountPercent: 10,
    };
    
    const totals = computeInvoiceTotals(invoice);
    
    expect(totals.subtotal).toBe(300);
    expect(totals.discountAmount).toBe(30); // 10% of 300
    expect(totals.grandTotal).toBe(270); // 300 - 30
  });

  it('should calculate per-line tax correctly', () => {
    const invoice: Invoice = {
      ...baseInvoice,
      lineItems: [
        { description: 'Item 1', amount: 100, quantity: 1, unitPrice: 100, taxPercent: 10 },
        { description: 'Item 2', amount: 200, quantity: 2, unitPrice: 100, taxPercent: 5 },
      ],
    };
    
    const totals = computeInvoiceTotals(invoice);
    
    expect(totals.subtotal).toBe(300);
    expect(totals.taxTotal).toBe(20); // (100 * 10%) + (200 * 5%) = 10 + 10
    expect(totals.grandTotal).toBe(320);
  });

  it('should calculate tax with discount applied proportionally', () => {
    const invoice: Invoice = {
      ...baseInvoice,
      discountEnabled: true,
      discountPercent: 10,
      lineItems: [
        { description: 'Item 1', amount: 100, quantity: 1, unitPrice: 100, taxPercent: 10 },
        { description: 'Item 2', amount: 200, quantity: 2, unitPrice: 100, taxPercent: 5 },
      ],
    };
    
    const totals = computeInvoiceTotals(invoice);
    
    expect(totals.subtotal).toBe(300);
    expect(totals.discountAmount).toBe(30);
    // Item 1: 100 - (100/300 * 30) = 90, tax = 9
    // Item 2: 200 - (200/300 * 30) = 180, tax = 9
    expect(totals.taxTotal).toBe(18);
    expect(totals.grandTotal).toBe(288); // 300 - 30 + 18
  });

  it('should calculate late fee accrued when invoice is overdue', () => {
    const pastDueDate = new Date();
    pastDueDate.setDate(pastDueDate.getDate() - 45); // 45 days ago
    
    const invoice: Invoice = {
      ...baseInvoice,
      dueDate: pastDueDate.toISOString().split('T')[0],
      lateFeeEnabled: true,
      feePercent: 5,
      applyEveryXDays: 30,
    };
    
    const totals = computeInvoiceTotals(invoice);
    
    expect(totals.subtotal).toBe(300);
    // 45 days / 30 days = 1 interval (floor)
    // Late fee = 300 * 5% * 1 = 15
    expect(totals.lateFeeAccrued).toBe(15);
    expect(totals.grandTotal).toBe(315);
  });

  it('should calculate late fee with multiple intervals', () => {
    const pastDueDate = new Date();
    pastDueDate.setDate(pastDueDate.getDate() - 75); // 75 days ago
    
    const invoice: Invoice = {
      ...baseInvoice,
      dueDate: pastDueDate.toISOString().split('T')[0],
      lateFeeEnabled: true,
      feePercent: 5,
      applyEveryXDays: 30,
    };
    
    const totals = computeInvoiceTotals(invoice);
    
    // 75 days / 30 days = 2 intervals (floor)
    // Late fee = 300 * 5% * 2 = 30
    expect(totals.lateFeeAccrued).toBe(30);
    expect(totals.grandTotal).toBe(330);
  });

  it('should calculate late fee with discount applied', () => {
    const pastDueDate = new Date();
    pastDueDate.setDate(pastDueDate.getDate() - 60); // 60 days ago
    
    const invoice: Invoice = {
      ...baseInvoice,
      dueDate: pastDueDate.toISOString().split('T')[0],
      discountEnabled: true,
      discountPercent: 10,
      lateFeeEnabled: true,
      feePercent: 5,
      applyEveryXDays: 30,
    };
    
    const totals = computeInvoiceTotals(invoice);
    
    expect(totals.subtotal).toBe(300);
    expect(totals.discountAmount).toBe(30);
    const subtotalAfterDiscount = 270;
    // 60 days / 30 days = 2 intervals
    // Late fee = 270 * 5% * 2 = 27
    expect(totals.lateFeeAccrued).toBe(27);
    expect(totals.grandTotal).toBe(297); // 300 - 30 + 27
  });

  it('should not calculate late fee if not overdue', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10); // 10 days in future
    
    const invoice: Invoice = {
      ...baseInvoice,
      dueDate: futureDate.toISOString().split('T')[0],
      lateFeeEnabled: true,
      feePercent: 5,
      applyEveryXDays: 30,
    };
    
    const totals = computeInvoiceTotals(invoice);
    
    expect(totals.lateFeeAccrued).toBe(0);
    expect(totals.grandTotal).toBe(300);
  });

  it('should handle legacy line items with amount only', () => {
    const invoice: Invoice = {
      ...baseInvoice,
      lineItems: [
        { description: 'Item 1', amount: 150 },
        { description: 'Item 2', amount: 250 },
      ],
    };
    
    const totals = computeInvoiceTotals(invoice);
    
    expect(totals.subtotal).toBe(400);
    expect(totals.grandTotal).toBe(400);
  });

  it('should handle empty line items', () => {
    const invoice: Invoice = {
      ...baseInvoice,
      lineItems: [],
    };
    
    const totals = computeInvoiceTotals(invoice);
    
    expect(totals.subtotal).toBe(0);
    expect(totals.grandTotal).toBe(0);
  });

  it('should calculate complete invoice with all features', () => {
    const pastDueDate = new Date();
    pastDueDate.setDate(pastDueDate.getDate() - 60);
    
    const invoice: Invoice = {
      ...baseInvoice,
      dueDate: pastDueDate.toISOString().split('T')[0],
      discountEnabled: true,
      discountPercent: 15,
      lateFeeEnabled: true,
      feePercent: 3,
      applyEveryXDays: 30,
      lineItems: [
        { description: 'Item 1', amount: 200, quantity: 2, unitPrice: 100, taxPercent: 8 },
        { description: 'Item 2', amount: 100, quantity: 1, unitPrice: 100, taxPercent: 5 },
      ],
    };
    
    const totals = computeInvoiceTotals(invoice);
    
    expect(totals.subtotal).toBe(300);
    expect(totals.discountAmount).toBe(45); // 15% of 300
    const subtotalAfterDiscount = 255;
    
    // Tax calculation with proportional discount:
    // Item 1: 200 - (200/300 * 45) = 170, tax = 13.6
    // Item 2: 100 - (100/300 * 45) = 85, tax = 4.25
    // Total tax ≈ 17.85 (rounded)
    expect(totals.taxTotal).toBeCloseTo(17.85, 1);
    
    // Late fee: 60 days / 30 days = 2 intervals
    // Late fee = 255 * 3% * 2 = 15.3
    expect(totals.lateFeeAccrued).toBeCloseTo(15.3, 1);
    
    // Grand total = 255 + 17.85 + 15.3 ≈ 288.15
    expect(totals.grandTotal).toBeCloseTo(288.15, 1);
  });
});
