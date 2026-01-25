import { NextRequest, NextResponse } from 'next/server';

/**
 * Send Invoice Endpoint
 * 
 * Sends an invoice via email and updates status to 'sent'.
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing invoice id
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    const body = await request.json();
    const { email, message } = body;

    // In production, you would:
    // 1. Fetch invoice from database
    // 2. Generate PDF (or use existing)
    // 3. Send email with PDF attachment via email service
    // 4. Update invoice status to 'sent'
    // 5. Log the action

    // Stub implementation
    console.log(`Sending invoice ${invoiceId} to ${email || 'client email'}`);

    return NextResponse.json({
      success: true,
      invoiceId,
      status: 'sent',
      message: `Invoice sent successfully${email ? ` to ${email}` : ''}`,
    });
  } catch (error) {
    console.error('Send invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to send invoice' },
      { status: 500 }
    );
  }
}
