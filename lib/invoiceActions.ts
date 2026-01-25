import type { Invoice } from '@/types/invoice';

/**
 * Download invoice as PDF
 */
export async function downloadInvoicePDF(invoiceId: string): Promise<void> {
  try {
    const response = await fetch(`/api/invoices/${invoiceId}/pdf`);
    if (!response.ok) throw new Error('Failed to generate PDF');
    
    const data = await response.json();
    
    // If server-side PDF generation is available, response will be a blob
    // Otherwise, use client-side fallback with html2canvas + jsPDF
    if (response.headers.get('content-type')?.includes('application/pdf')) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Fallback: Use client-side PDF generation
      console.warn('Server-side PDF not available. Using client-side fallback.');
      // In production, implement html2canvas + jsPDF here
      alert('PDF generation requires client-side library. Install html2canvas and jspdf.');
    }
  } catch (error) {
    console.error('PDF download error:', error);
    throw error;
  }
}

/**
 * Share invoice and get shareable URL
 */
export async function shareInvoice(invoiceId: string, email?: string): Promise<string> {
  try {
    const url = email 
      ? `/api/invoices/${invoiceId}/share?email=${encodeURIComponent(email)}`
      : `/api/invoices/${invoiceId}/share`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to generate share link');
    
    const data = await response.json();
    return data.shareUrl;
  } catch (error) {
    console.error('Share error:', error);
    throw error;
  }
}

/**
 * Send invoice via email
 */
export async function sendInvoice(invoiceId: string, email?: string, message?: string): Promise<void> {
  try {
    const response = await fetch(`/api/invoices/${invoiceId}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, message }),
    });
    
    if (!response.ok) throw new Error('Failed to send invoice');
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Send invoice error:', error);
    throw error;
  }
}

/**
 * Apply late fees to invoice (mutates invoice by adding fee line item)
 */
export function applyLateFees(invoice: Invoice, totals: { lateFeeAccrued: number }): Invoice {
  if (totals.lateFeeAccrued <= 0) return invoice;
  
  // Add late fee as a line item
  const lateFeeItem = {
    description: `Late Fee (${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'})`,
    amount: totals.lateFeeAccrued,
    quantity: 1,
    unitPrice: totals.lateFeeAccrued,
  };
  
  return {
    ...invoice,
    lineItems: [...invoice.lineItems, lateFeeItem],
    // Reset late fee flags since it's now applied
    lateFeeEnabled: false,
    feePercent: undefined,
    applyEveryXDays: undefined,
  };
}
