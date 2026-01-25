import { NextRequest, NextResponse } from 'next/server';

/**
 * Invoice Share Endpoint
 * 
 * Generates a shareable URL for an invoice.
 * In production, this would:
 * - Generate a signed/temporary URL from storage (S3, CloudFront, etc.)
 * - Or create a secure token-based share link
 * - Optionally send email with the share link
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing invoice id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    // In production, you would:
    // 1. Verify user has permission to share this invoice
    // 2. Generate a secure token or signed URL
    // 3. Store the share link in database with expiration
    // 4. If email provided, send email with share link
    // 5. Return the shareable URL

    // Example implementation:
    const shareToken = Buffer.from(`${invoiceId}-${Date.now()}`).toString('base64');
    const shareUrl = `${request.nextUrl.origin}/share/invoice/${shareToken}`;

    // If email provided, trigger email sending (stub)
    if (email) {
      // await sendInvoiceEmail(invoiceId, email, shareUrl);
      console.log(`Would send invoice ${invoiceId} to ${email} with link: ${shareUrl}`);
    }

    return NextResponse.json({
      success: true,
      invoiceId,
      shareUrl,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      message: email ? `Share link sent to ${email}` : 'Share link generated',
    });
  } catch (error) {
    console.error('Share generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate share link' },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to send invoice via email
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    const body = await request.json();
    const { email, message } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    // await sendInvoiceEmail(invoiceId, email, message);

    return NextResponse.json({
      success: true,
      invoiceId,
      message: `Invoice sent to ${email}`,
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send invoice' },
      { status: 500 }
    );
  }
}
