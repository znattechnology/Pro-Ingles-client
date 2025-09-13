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

// Handle different subscription endpoints
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'plans';
    
    // Get Django JWT authentication
    const user = getUserFromToken(request);
    
    let djangoEndpoint = '';
    
    switch (endpoint) {
      case 'plans':
        djangoEndpoint = '/api/v1/subscriptions/plans/';
        break;
      case 'analytics':
        djangoEndpoint = '/api/v1/subscriptions/analytics/';
        break;
      case 'admin-plans':
        djangoEndpoint = '/api/v1/subscriptions/admin/plans/';
        break;
      case 'admin-subscriptions':
        djangoEndpoint = '/api/v1/subscriptions/admin/subscriptions/';
        break;
      case 'admin-stats':
        djangoEndpoint = '/api/v1/subscriptions/admin/stats/';
        break;
      case 'admin-promo-codes':
        djangoEndpoint = '/api/v1/subscriptions/admin/promo-codes/';
        break;
      case 'admin-promo-code-usage':
        djangoEndpoint = '/api/v1/subscriptions/admin/promo-code-usage/';
        break;
      case 'my-subscription':
        djangoEndpoint = '/api/v1/subscriptions/my-subscription/';
        break;
      case 'apply-promo-code':
        djangoEndpoint = '/api/v1/subscriptions/apply-promo-code/';
        break;
      case 'upgrade':
        djangoEndpoint = '/api/v1/subscriptions/upgrade/';
        break;
      default:
        djangoEndpoint = `/api/v1/subscriptions/${endpoint}/`;
    }
    
    console.log('Fetching from Django:', `${API_BASE_URL}${djangoEndpoint}`);
    console.log('User:', user ? user.email : 'Not authenticated');

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authentication for protected endpoints
    const protectedEndpoints = ['admin-plans', 'admin-subscriptions', 'admin-stats', 'admin-promo-codes', 'admin-promo-code-usage', 'analytics', 'my-subscription', 'upgrade'];
    if (protectedEndpoints.includes(endpoint)) {
      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      // For admin endpoints, check if user is admin
      if ((endpoint === 'admin-plans' || endpoint === 'admin-subscriptions' || endpoint === 'admin-stats' || endpoint === 'admin-promo-codes' || endpoint === 'admin-promo-code-usage') && user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }
      
      // Forward the JWT token to Django
      const token = request.cookies.get('access_token')?.value || 
                   request.headers.get('authorization')?.replace('Bearer ', '');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Also add user ID for Django to identify the user
      headers['X-User-ID'] = user.user_id;
    }
    
    // Forward the request to the Django backend
    const response = await fetch(`${API_BASE_URL}${djangoEndpoint}`, {
      method: 'GET',
      headers,
    });

    console.log('Django response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.log('Django error response:', errorData);
      
      return NextResponse.json(
        { error: `Failed to fetch ${endpoint}`, details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in subscription API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle POST requests (create, apply promo code, upgrade)
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || '';
    
    // Get Django JWT authentication
    const user = getUserFromToken(request);
    
    let djangoEndpoint = '';
    
    switch (endpoint) {
      case 'apply-promo-code':
        djangoEndpoint = '/api/v1/subscriptions/apply-promo-code/';
        break;
      case 'upgrade':
        djangoEndpoint = '/api/v1/subscriptions/upgrade/';
        break;
      case 'admin-plans':
        djangoEndpoint = '/api/v1/subscriptions/admin/plans/';
        break;
      case 'admin-promo-codes':
        djangoEndpoint = '/api/v1/subscriptions/admin/promo-codes/';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid POST endpoint' },
          { status: 400 }
        );
    }
    
    console.log('POST to Django:', `${API_BASE_URL}${djangoEndpoint}`);
    console.log('User:', user ? user.email : 'Not authenticated');

    // All POST endpoints require authentication
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Admin endpoints require admin role
    if ((endpoint === 'admin-plans' || endpoint === 'admin-promo-codes') && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

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
    
    // Get request body
    const body = await request.json();
    
    // Forward the request to Django
    const response = await fetch(`${API_BASE_URL}${djangoEndpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    console.log('Django POST response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.log('Django POST error response:', errorData);
      
      return NextResponse.json(
        { error: `Failed to process ${endpoint}`, details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in subscription POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}