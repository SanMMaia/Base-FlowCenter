import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch('https://sacmais.com.br', {
      headers: {
        'Content-Type': 'text/html',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch Sacmais');
    }
    
    const html = await response.text();
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching Sacmais' },
      { status: 500 }
    );
  }
}
