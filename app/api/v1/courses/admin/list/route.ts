import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const DJANGO_BASE_URL = process.env.DJANGO_API_URL || 'http://localhost:8000/api/v1';

export async function GET(request: NextRequest) {
  try {
    // Get authorization token from request headers
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      );
    }

    // Forward request to Django admin courses endpoint
    const djangoUrl = `${DJANGO_BASE_URL}/courses/admin/list/`;
    
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
    console.error('Erro no proxy de courses admin list:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}