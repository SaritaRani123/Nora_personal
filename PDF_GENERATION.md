# PDF Generation Guide

This document explains how to set up server-side PDF generation for invoices.

## Server-Side PDF Generation (Preferred)

### Option 1: Using Puppeteer

Puppeteer is the recommended approach for server-side PDF generation as it provides high-quality, consistent PDFs.

#### Installation

```bash
npm install puppeteer
# or for lighter installation
npm install puppeteer-core
```

#### Implementation

Update `app/api/invoices/[id]/pdf/route.ts`:

```typescript
import puppeteer from 'puppeteer';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const invoiceId = params.id;
    
    // 1. Fetch invoice data from database
    const invoice = await getInvoiceById(invoiceId);
    
    // 2. Render HTML template with invoice data
    const htmlContent = renderInvoiceHTML(invoice);
    
    // 3. Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    });
    
    await browser.close();
    
    // 4. Return PDF as response
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoiceId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
```

#### HTML Template Function

```typescript
function renderInvoiceHTML(invoice: Invoice): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .invoice-header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
          .invoice-details { margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total-row { font-weight: bold; background-color: #f9f9f9; }
          .text-right { text-align: right; }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <h1>Invoice ${invoice.invoiceNumber}</h1>
          <p>Issue Date: ${formatDate(invoice.issueDate)}</p>
          ${invoice.dueDate ? `<p>Due Date: ${formatDate(invoice.dueDate)}</p>` : ''}
        </div>
        <div class="invoice-details">
          <h3>Bill To:</h3>
          <p>${invoice.clientName}</p>
          ${invoice.clientEmail ? `<p>${invoice.clientEmail}</p>` : ''}
        </div>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-right">Quantity</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Tax %</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.lineItems.map(item => `
              <tr>
                <td>${item.description}</td>
                <td class="text-right">${item.quantity || 1}</td>
                <td class="text-right">$${(item.unitPrice || item.amount).toFixed(2)}</td>
                <td class="text-right">${item.taxPercent || 0}%</td>
                <td class="text-right">$${((item.quantity || 1) * (item.unitPrice || item.amount)).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="4" class="text-right">Grand Total:</td>
              <td class="text-right">$${invoice.amount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </body>
    </html>
  `;
}
```

### Option 2: Using Playwright

Playwright is an alternative to Puppeteer with similar capabilities.

#### Installation

```bash
npm install playwright
```

#### Implementation

Similar to Puppeteer, but use `playwright` instead:

```typescript
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(htmlContent);
const pdf = await page.pdf({ format: 'A4' });
await browser.close();
```

## Client-Side PDF Generation (Fallback)

If server-side rendering is not available, use html2canvas + jsPDF as a fallback.

### Installation

```bash
npm install html2canvas jspdf
```

### Implementation

```typescript
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function downloadInvoicePDFClientSide(invoiceId: string) {
  // Get the invoice HTML element
  const element = document.getElementById('invoice-preview');
  if (!element) return;
  
  // Convert to canvas
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
  });
  
  // Create PDF
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgData = canvas.toDataURL('image/png');
  const imgWidth = 210; // A4 width in mm
  const pageHeight = 295; // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  
  let position = 0;
  
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  
  pdf.save(`invoice-${invoiceId}.pdf`);
}
```

## Production Considerations

1. **Caching**: Cache generated PDFs to avoid regenerating on every request
2. **Storage**: Store PDFs in cloud storage (S3, CloudFront) for faster delivery
3. **Queue**: For high-volume applications, use a job queue (Bull, BullMQ) for PDF generation
4. **Error Handling**: Implement retry logic and fallback mechanisms
5. **Performance**: Consider using a dedicated PDF service (like PDFShift, DocRaptor) for better scalability

## Environment Variables

Add to `.env.local`:

```env
# For Puppeteer
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false

# For production deployments
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

## Docker Considerations

If deploying in Docker, ensure Chromium is available:

```dockerfile
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-sandbox
```
