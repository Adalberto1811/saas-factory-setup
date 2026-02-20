import { NextRequest, NextResponse } from 'next/server';
import { PSEService } from '@/shared/services/PSEService';

export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Todos los campos son obligatorios.' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'La contraseña debe tener al menos 6 caracteres.' },
                { status: 400 }
            );
        }

        const userId = await PSEService.registerUser(name, email, password);

        return NextResponse.json({
            success: true,
            userId,
            message: 'Usuario registrado exitosamente.'
        });

    } catch (error: any) {
        console.error('[REGISTER_API_ERROR]', error);
        return NextResponse.json(
            { error: error.message || 'Error al registrar usuario.' },
            { status: 500 }
        );
    }
}
