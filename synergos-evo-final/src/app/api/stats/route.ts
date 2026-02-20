import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory stats (for demo purposes)
// In production, use database
let stats = {
    files: 0,
    minutes: 0
};

export async function GET() {
    return NextResponse.json(stats);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { serviceType, durationSeconds } = body;

        if (serviceType === 'transcription') {
            stats.files += 1;
            stats.minutes += Math.round((durationSeconds || 60) / 60);
        }

        return NextResponse.json({
            success: true,
            stats
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update stats' },
            { status: 500 }
        );
    }
}
