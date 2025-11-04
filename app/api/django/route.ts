import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const DJANGO_BASE_URL = 'http://34.245.99.169:8000/api/v1';

async function proxyToDjango(request: NextRequest, method: string) {
  try {
    // Extract path from URL
    const url = new URL(request.url);
    const apiPath = url.pathname.replace('/api/django', '');
    const pathSegments = apiPath.startsWith('/') ? apiPath.slice(1) : apiPath;
    const searchParams = url.searchParams.toString();
    
    // Ensure trailing slash for Django endpoints
    const formattedPath = pathSegments.endsWith('/') ? pathSegments : `${pathSegments}/`;
    const djangoUrl = `${DJANGO_BASE_URL}/${formattedPath}${searchParams ? `?${searchParams}` : ''}`;
    
    console.log(`[PROXY ${method}] ${djangoUrl}`);

    // Get request body if present
    let body = undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        body = await request.text();
      } catch {
        body = undefined;
      }
    }

    // Forward headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Forward authorization header if present
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Forward other important headers
    const forwardHeaders = ['user-agent', 'accept-language', 'x-forwarded-for'];
    forwardHeaders.forEach(headerName => {
      const headerValue = request.headers.get(headerName);
      if (headerValue) {
        headers[headerName] = headerValue;
      }
    });

    // Make request to Django
    const djangoResponse = await fetch(djangoUrl, {
      method,
      headers,
      body: body || undefined,
    });

    console.log(`[PROXY RESPONSE] ${djangoResponse.status} ${djangoResponse.statusText}`);

    // Get response data
    let responseData;
    const contentType = djangoResponse.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      responseData = await djangoResponse.json();
    } else {
      responseData = await djangoResponse.text();
    }

    // Return response with appropriate status
    return NextResponse.json(responseData, {
      status: djangoResponse.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error(`[PROXY ERROR] ${method}:`, error);
    return NextResponse.json(
      { error: 'Proxy error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return proxyToDjango(request, 'GET');
}

export async function POST(request: NextRequest) {
  return proxyToDjango(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return proxyToDjango(request, 'PUT');
}

export async function DELETE(request: NextRequest) {
  return proxyToDjango(request, 'DELETE');
}

export async function PATCH(request: NextRequest) {
  return proxyToDjango(request, 'PATCH');
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}