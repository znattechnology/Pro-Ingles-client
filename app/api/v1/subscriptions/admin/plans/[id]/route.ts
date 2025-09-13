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

interface RouteParams {
  params: {
    id: string;
  };
}

// PUT /api/v1/subscriptions/admin/plans/[id] - Update plan (admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const planId = params.id;
    
    console.log('PUT Django Admin Plan:', `${API_BASE_URL}/api/v1/subscriptions/admin/plans/${planId}/`);
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
    const response = await fetch(`${API_BASE_URL}/api/v1/subscriptions/admin/plans/${planId}/`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    console.log('Django PUT response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.log('Django PUT error response:', errorData);
      
      return NextResponse.json(
        { error: 'Failed to update plan', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/subscriptions/admin/plans/[id] - Delete plan (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const planId = params.id;
    
    console.log('DELETE Django Admin Plan:', `${API_BASE_URL}/api/v1/subscriptions/admin/plans/${planId}/`);
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
    const response = await fetch(`${API_BASE_URL}/api/v1/subscriptions/admin/plans/${planId}/`, {
      method: 'DELETE',
      headers,
    });

    console.log('Django DELETE response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.log('Django DELETE error response:', errorData);
      
      return NextResponse.json(
        { error: 'Failed to delete plan', details: errorData },
        { status: response.status }
      );
    }

    // Django DELETE usually returns 204 No Content for successful deletions
    if (response.status === 204) {
      return NextResponse.json({ message: 'Plan deleted successfully' });
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}