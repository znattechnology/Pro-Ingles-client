import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// Backend API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface JWTPayload {
  user_id: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  name: string;
  exp: number;
  iat: number;
}

// Get user from JWT token stored in cookie
function getUserFromToken(request: NextRequest): JWTPayload | null {
  try {
    // Try to get token from Authorization header first
    const authHeader = request.headers.get('authorization');
    let token = authHeader?.replace('Bearer ', '');

    // If not in header, try cookies
    if (!token) {
      token = request.cookies.get('access_token')?.value;
    }

    if (!token || token.trim() === '') {
      return null;
    }

    const decoded = jwtDecode<JWTPayload>(token);
    
    // Check if token is expired
    if (decoded.exp * 1000 <= Date.now() + 30000) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get Django JWT authentication
    const user = getUserFromToken(request);
    
    // Check authentication and admin role
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    console.log('GET Django Admin Plans:', `${API_BASE_URL}/api/v1/subscriptions/admin/plans/`);
    console.log('User:', user.email);

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Forward the JWT token to Django
    const token = request.cookies.get('access_token')?.value || 
                 request.headers.get('authorization')?.replace('Bearer ', '');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    headers['X-User-ID'] = user.user_id;
    
    // Forward the request to the Django backend
    const response = await fetch(`${API_BASE_URL}/api/v1/subscriptions/admin/plans/`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch admin subscription plans' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error fetching admin subscription plans:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get Django JWT authentication
    const user = getUserFromToken(request);
    
    // Check authentication and admin role
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    console.log('POST Django Admin Plans:', `${API_BASE_URL}/api/v1/subscriptions/admin/plans/`);
    console.log('User:', user.email);

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Forward the JWT token to Django
    const token = request.cookies.get('access_token')?.value || 
                 request.headers.get('authorization')?.replace('Bearer ', '');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    headers['X-User-ID'] = user.user_id;
    
    // Forward the request to the Django backend
    const response = await fetch(`${API_BASE_URL}/api/v1/subscriptions/admin/plans/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to create subscription plan' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}