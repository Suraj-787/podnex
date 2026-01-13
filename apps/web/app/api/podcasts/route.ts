import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL}/api/v1/podcasts${queryString ? `?${queryString}` : ''}`;

    // Get cookies from the request
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll()
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join('; ');

    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieHeader,
            },
            credentials: 'include',
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch podcasts' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const url = `${BACKEND_URL}/api/v1/podcasts`;

    // Get cookies from the request
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll()
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join('; ');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieHeader,
            },
            body: JSON.stringify(body),
            credentials: 'include',
        });

        const data = await response.json();

        // Log error responses for debugging
        if (!response.ok) {
            console.error('Backend error:', response.status, data);
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to create podcast' },
            { status: 500 }
        );
    }
}
