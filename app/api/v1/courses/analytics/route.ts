import { NextRequest, NextResponse } from 'next/server';

const DJANGO_BASE_URL = process.env.DJANGO_API_URL || 'http://localhost:8000/api/v1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'overview';
    
    // Map frontend endpoints to Django URLs
    const djangoEndpointMap: Record<string, string> = {
      'overview': '/courses/admin/analytics/overview/',
      'real-time': '/courses/admin/analytics/real-time/',
      'export': '/courses/admin/analytics/export/',
    };

    const djangoEndpoint = djangoEndpointMap[endpoint];
    
    if (!djangoEndpoint) {
      return NextResponse.json(
        { error: 'Endpoint inválido' },
        { status: 400 }
      );
    }

    // Get authorization token from request headers
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      );
    }

    // Forward request to Django
    const djangoUrl = `${DJANGO_BASE_URL}${djangoEndpoint}`;
    
    const djangoResponse = await fetch(djangoUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!djangoResponse.ok) {
      const errorData = await djangoResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Erro ao buscar dados do Django' },
        { status: djangoResponse.status }
      );
    }

    const data = await djangoResponse.json();
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Erro no proxy de analytics:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'clear-cache') {
      // Get authorization token from request headers
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader) {
        return NextResponse.json(
          { error: 'Token de autorização necessário' },
          { status: 401 }
        );
      }

      // Forward cache clear request to Django
      const djangoUrl = `${DJANGO_BASE_URL}/courses/admin/analytics/clear-cache/`;
      
      const djangoResponse = await fetch(djangoUrl, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (!djangoResponse.ok) {
        const errorData = await djangoResponse.json().catch(() => ({}));
        return NextResponse.json(
          { error: errorData.error || 'Erro ao limpar cache' },
          { status: djangoResponse.status }
        );
      }

      const data = await djangoResponse.json();
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: 'Ação inválida' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Erro no proxy de analytics POST:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}