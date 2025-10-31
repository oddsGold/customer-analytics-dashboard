import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const q = url.searchParams.get('q');

    if (!q || typeof q !== 'string') {
        return NextResponse.json({ error: 'Query parameter "q" is required and must be a string' }, { status: 400 });
    }

    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q,
                format: 'json',
                addressdetails: 1,
                limit: 5,
                countrycodes: 'UA',
            },
            headers: {
                'User-Agent': 'NextPizza',
                'Accept-Language': 'uk',
            },
        });

        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
