import type { Invoice, InvoiceLineItem } from '@/types/invoice';

export interface InvoiceTotals {
  subtotal: number;
  discountAmount: number;
  taxTotal: number;
  lateFeeAccrued: number;
  grandTotal: number;
}

/**
 * Computes invoice totals including subtotal, discount, tax, late fees, and grand total.
 * 
 * Calculation logic:
 * - Subtotal: sum of all line item totals (quantity * unitPrice, or amount if legacy)
 * - Discount: applied to subtotal before tax (if discountEnabled)
 * - Tax: calculated per-line on (lineTotal - proportional discount) * taxPercent
 * - Late Fee: computed for preview if lateFeeEnabled and invoice is overdue
 * - Grand Total: subtotal - discount + tax + lateFee
 */
export function computeInvoiceTotals(invoice: Invoice): InvoiceTotals {
  const today = new Date();
  const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;
  
  // Calculate subtotal from line items
  let subtotal = 0;
  const lineTotals: number[] = [];
  
  invoice.lineItems.forEach((item: InvoiceLineItem) => {
    let lineTotal: number;
    
    // Support both new format (quantity * unitPrice) and legacy (amount)
    if (item.quantity !== undefined && item.unitPrice !== undefined) {
      lineTotal = item.quantity * item.unitPrice;
    } else {
      lineTotal = item.amount || 0;
    }
    
    lineTotals.push(lineTotal);
    subtotal += lineTotal;
  });
  
  // Calculate discount
  let discountAmount = 0;
  if (invoice.discountEnabled && invoice.discountPercent) {
    discountAmount = subtotal * (invoice.discountPercent / 100);
  }
  
  const subtotalAfterDiscount = subtotal - discountAmount;
  
  // Calculate tax per line item
  let taxTotal = 0;
  if (subtotal > 0) {
    invoice.lineItems.forEach((item: InvoiceLineItem, index: number) => {
      const lineTotal = lineTotals[index];
      const lineDiscount = subtotal > 0 ? (lineTotal / subtotal) * discountAmount : 0;
      const lineTotalAfterDiscount = lineTotal - lineDiscount;
      
      if (item.taxPercent) {
        taxTotal += lineTotalAfterDiscount * (item.taxPercent / 100);
      }
    });
  }
  
  // Calculate late fee (preview only, not applied unless user confirms)
  let lateFeeAccrued = 0;
  if (invoice.lateFeeEnabled && dueDate && today > dueDate) {
    const daysPastDue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    const applyEveryXDays = invoice.applyEveryXDays || 30; // default to 30 days
    const intervals = Math.floor(daysPastDue / applyEveryXDays);
    
    if (intervals > 0 && invoice.feePercent) {
      lateFeeAccrued = subtotalAfterDiscount * (invoice.feePercent / 100) * intervals;
    }
  }
  
  // Calculate grand total
  const grandTotal = subtotalAfterDiscount + taxTotal + lateFeeAccrued;
  
  return {
    subtotal,
    discountAmount,
    taxTotal,
    lateFeeAccrued,
    grandTotal,
  };
}
