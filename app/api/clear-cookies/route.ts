import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  
  // Clear authentication cookies with various configurations
  const cookiesToClear = ['access_token', 'refresh_token'];
  
  cookiesToClear.forEach(cookieName => {
    // Clear with different path and domain combinations
    response.cookies.set(cookieName, '', {
      expires: new Date(0),
      path: '/',
    });
    
    response.cookies.set(cookieName, '', {
      expires: new Date(0),
      path: '/',
      domain: request.nextUrl.hostname,
    });
    
    response.cookies.set(cookieName, '', {
      expires: new Date(0),
      path: '/',
      secure: true,
    });
    
    response.cookies.set(cookieName, '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
    });
  });
  
  return response;
}