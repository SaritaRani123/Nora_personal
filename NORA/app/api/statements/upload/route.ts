import { NextResponse } from 'next/server'

// ============================================================
// Statement Upload API Route (Mock S3 Upload)
// ============================================================
// This route simulates uploading a file to S3.
// 
// To switch to real AWS S3:
// 1. Install @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner
// 2. Configure AWS credentials via environment variables
// 3. Replace the mock implementation with actual S3 operations
//
// Example AWS S3 implementation:
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
// const s3Client = new S3Client({ region: process.env.AWS_REGION })
// ============================================================

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // ============================================================
    // TODO: Replace mock implementation with actual S3 upload
    // ============================================================
    // const command = new PutObjectCommand({
    //   Bucket: process.env.S3_BUCKET_NAME,
    //   Key: `statements/${Date.now()}-${file.name}`,
    //   Body: Buffer.from(await file.arrayBuffer()),
    //   ContentType: file.type,
    // })
    // await s3Client.send(command)
    // ============================================================

    // Simulate upload delay (mock S3 behavior)
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Extract bank name from filename or default to Scotia Bank
    const fileName = file.name.toLowerCase()
    let bank = 'Scotia Bank'
    if (fileName.includes('scotiabank') || fileName.includes('scotia')) {
      bank = 'Scotia Bank'
    } else if (fileName.includes('td')) {
      bank = 'TD'
    } else if (fileName.includes('rbc')) {
      bank = 'RBC'
    }

    // Generate mock transaction details
    const mockTransactionDetails = [
      { category: 'Food & Dining', amount: 45.99, date: '2026-01-24', type: 'debit' as const },
      { category: 'Office Expenses', amount: 234.50, date: '2026-01-23', type: 'debit' as const },
      { category: 'Client Payment', amount: 5000.00, date: '2026-01-22', type: 'credit' as const },
      { category: 'Fuel & Commute', amount: 78.00, date: '2026-01-21', type: 'debit' as const },
      { category: 'Software & Subscriptions', amount: 54.99, date: '2026-01-20', type: 'debit' as const },
      { category: 'Invoice Payment', amount: 2500.00, date: '2026-01-19', type: 'credit' as const },
      { category: 'Utilities', amount: 189.45, date: '2026-01-18', type: 'debit' as const },
      { category: 'Marketing & Advertising', amount: 500.00, date: '2026-01-17', type: 'debit' as const },
      { category: 'Travel & Accommodation', amount: 325.00, date: '2026-01-16', type: 'debit' as const },
      { category: 'Consulting Fee', amount: 3000.00, date: '2026-01-15', type: 'credit' as const },
      { category: 'Insurance', amount: 450.00, date: '2026-01-14', type: 'debit' as const },
      { category: 'Refund - Product Return', amount: 120.00, date: '2026-01-13', type: 'credit' as const },
    ]

    const transactions = mockTransactionDetails.length

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      bank,
      transactions,
      transactionDetails: mockTransactionDetails,
      s3Key: `statements/${Date.now()}-${file.name}`,
      message: 'File uploaded successfully',
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
