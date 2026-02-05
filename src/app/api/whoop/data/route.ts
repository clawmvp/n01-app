import { NextRequest, NextResponse } from 'next/server';

// Helper endpoint to fetch WHOOP data using access token
// Pass token as Authorization header: Bearer <access_token>

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { 
        error: 'Missing Authorization header',
        usage: 'Pass header: Authorization: Bearer <your_access_token>'
      },
      { status: 401 }
    );
  }
  
  const accessToken = authHeader.split(' ')[1];
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get('endpoint') || 'profile';
  
  // Available WHOOP API endpoints
  const endpoints: Record<string, string> = {
    profile: '/v1/user/profile/basic',
    recovery: '/v1/recovery',
    sleep: '/v1/activity/sleep',
    cycles: '/v1/cycle',
    workouts: '/v1/activity/workout',
    body: '/v1/user/measurement/body',
  };
  
  const path = endpoints[endpoint];
  if (!path) {
    return NextResponse.json(
      { 
        error: 'Invalid endpoint',
        available: Object.keys(endpoints)
      },
      { status: 400 }
    );
  }
  
  try {
    const response = await fetch(`https://api.prod.whoop.com/developer${path}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch WHOOP data', details: (err as Error).message },
      { status: 500 }
    );
  }
}
