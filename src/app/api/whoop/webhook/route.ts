import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Log webhook payload
  console.log('WHOOP webhook received:', JSON.stringify(body, null, 2));
  
  // Process different event types
  const { type, data } = body || {};
  
  switch (type) {
    case 'recovery.updated':
      console.log('Recovery updated:', data);
      break;
    case 'sleep.updated':
      console.log('Sleep updated:', data);
      break;
    case 'workout.updated':
      console.log('Workout updated:', data);
      break;
    default:
      console.log('Unknown event type:', type);
  }
  
  return NextResponse.json({ received: true, type });
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
