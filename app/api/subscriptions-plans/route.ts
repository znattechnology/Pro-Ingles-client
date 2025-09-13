import { NextRequest, NextResponse } from 'next/server';

// Backend API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching from:', `${API_BASE_URL}/api/v1/subscriptions/plans/`);
    
    // Forward the request to the Django backend
    const response = await fetch(`${API_BASE_URL}/api/v1/subscriptions/plans/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        }),
      },
    });

    console.log('Django response status:', response.status);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch subscription plans' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Data received:', data.length, 'plans');
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}