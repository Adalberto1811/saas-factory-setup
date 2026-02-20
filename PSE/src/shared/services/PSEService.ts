import { sql } from '../lib/neon';
import bcrypt from 'bcryptjs';

export interface PSEPlan {
    id: string;
    user_id: number;
    name: string;
    fecha_inicio: string;
    fecha_competencia?: string;
    total_microciclos: number;
    current_microciclo: number;
    status: 'active' | 'completed' | 'archived';
    metadata: any;
}

export interface PSEMicrocycle {
    id: string;
    plan_id: string;
    numero_semana: number;
    data: any;
    feedback_usuario?: string;
    completado: boolean;
    sentimiento_atleta?: number;
}

export class PSEService {
    /**
     * Busca un usuario por nombre o lo crea si no existe.
     * BLINDADO: Usa ON CONFLICT para manejar emails duplicados.
     */
    static async getOrCreateUserByName(name: string): Promise<number> {
        // 1. Intentar buscar por nombre exacto
        const byName = await sql`
            SELECT id FROM users WHERE full_name = ${name} LIMIT 1
        `;
        if (byName.length > 0) return (byName[0] as any).id;

        // 2. Generar email único
        const email = name.toLowerCase().replace(/\s+/g, '.') + '@pse-atleta.com';

        // 3. Buscar por email (por si ya existe con nombre diferente)
        const byEmail = await sql`
            SELECT id FROM users WHERE email = ${email} LIMIT 1
        `;
        if (byEmail.length > 0) return (byEmail[0] as any).id;

        // 4. Insertar nuevo usuario (ya sabemos que no existe)
        const newUser = await sql`
            INSERT INTO users (full_name, email, whatsapp)
            VALUES (${name}, ${email}, ${null})
            ON CONFLICT (email) DO UPDATE SET full_name = ${name}
            RETURNING id
        `;

        return (newUser[0] as any).id;
    }

    /**
     * Busca un usuario por email.
     */
    static async getUserByEmail(email: string): Promise<{ id: number; full_name: string; role: string } | null> {
        const users = await sql`
            SELECT id, full_name, role FROM users WHERE email = ${email.toLowerCase()} LIMIT 1
        `;
        return users.length > 0 ? (users[0] as any) : null;
    }

    /**
     * Registra un nuevo usuario de forma segura.
     */
    static async registerUser(name: string, email: string, password: string, whatsapp?: string): Promise<number> {
        const passwordHash = await bcrypt.hash(password, 10);

        try {
            const result = await sql`
                INSERT INTO users (full_name, email, password_hash, whatsapp)
                VALUES (${name}, ${email.toLowerCase()}, ${passwordHash}, ${whatsapp || null})
                RETURNING id
            `;
            return (result[0] as any).id;
        } catch (error: any) {
            if (error.message?.includes('unique constraint') || error.message?.includes('already exists')) {
                throw new Error('El usuario ya existe con este correo electrónico.');
            }
            throw error;
        }
    }


    /**
     * Obtiene o crea un plan activo para el usuario
     */
    static async getOrCreateActivePlan(userId: number, name: string = 'Mi Plan de Entrenamiento'): Promise<PSEPlan> {
        // Intentar obtener plan activo
        const plans = await sql<PSEPlan[]>`
            SELECT * FROM pse_plans 
            WHERE user_id = ${userId} AND status = 'active'
            LIMIT 1
        `;

        if (plans.length > 0) return plans[0];

        // Si no existe, crear uno nuevo (default 12, pero permite hasta 20 según lógica PSE)
        const newPlan = await sql<PSEPlan[]>`
            INSERT INTO pse_plans (user_id, name, total_microciclos)
            VALUES (${userId}, ${name}, ${12}) 
            RETURNING *
        `;

        return newPlan[0];
    }

    /**
     * Obtiene el último microciclo generado para un plan
     */
    static async getLastMicrocycle(planId: string): Promise<PSEMicrocycle | null> {
        const microcycles = await sql<PSEMicrocycle[]>`
            SELECT * FROM pse_microcycles 
            WHERE plan_id = ${planId}
            ORDER BY numero_semana DESC
            LIMIT 1
        `;

        return microcycles.length > 0 ? microcycles[0] : null;
    }

    /**
     * Guarda un nuevo microciclo y actualiza el contador del plan
     */
    static async saveMicrocycle(planId: string, numeroSemana: number, data: any): Promise<void> {
        await sql`
            INSERT INTO pse_microcycles (plan_id, numero_semana, data)
            VALUES (${planId}, ${numeroSemana}, ${data})
        `;

        await sql`
            UPDATE pse_plans 
            SET current_microciclo = ${numeroSemana},
                updated_at = NOW()
            WHERE id = ${planId}
        `;
    }

    /**
     * Verifica si el usuario tiene una suscripción activa
     */
    static async checkSubscription(userId: number): Promise<boolean> {
        const subs = await sql`
            SELECT status FROM pse_subscriptions 
            WHERE user_id = ${userId} 
            AND status = 'active'
            AND (expires_at IS NULL OR expires_at > NOW())
            LIMIT 1
        `;

        return subs.length > 0;
    }

    /**
     * Registra feedback para el último microciclo
     */
    static async updateFeedback(microcycleId: string, feedback: string, sentimiento?: number): Promise<void> {
        await sql`
            UPDATE pse_microcycles 
            SET feedback_usuario = ${feedback},
                sentimiento_atleta = ${sentimiento},
                completado = TRUE
            WHERE id = ${microcycleId}
        `;
    }

    /**
     * Obtiene la fecha de creación del usuario
     */
    static async getUserSettings(userId: number): Promise<{ created_at: Date } | null> {
        const users = await sql`
            SELECT created_at FROM users WHERE id = ${userId}
        `;
        return users.length > 0 ? { created_at: new Date((users[0] as any).created_at) } : null;
    }

    /**
     * Cuenta cuántos microciclos ha generado el usuario en total (en todos sus planes)
     */
    static async getTotalMicrocyclesCount(userId: number): Promise<number> {
        const result = await sql`
            SELECT COUNT(*) as count 
            FROM pse_microcycles m
            JOIN pse_plans p ON m.plan_id = p.id
            WHERE p.user_id = ${userId}
        `;
        return parseInt((result[0] as any).count, 10);
    }

    /**
     * Busca si ya existe un microciclo generado en un rango de fechas
     */
    static async getMicrocycleInDateRange(planId: string, startDate: Date, endDate: Date): Promise<PSEMicrocycle | null> {
        const microcycles = await sql<PSEMicrocycle[]>`
            SELECT * FROM pse_microcycles 
            WHERE plan_id = ${planId}
            AND created_at >= ${startDate.toISOString()}
            AND created_at <= ${endDate.toISOString()}
            ORDER BY created_at DESC
            LIMIT 1
        `;
        return microcycles.length > 0 ? microcycles[0] : null;
    }

    /**
     * Obtiene el rol de un usuario
     */
    static async getUserRole(userId: number): Promise<{ role: string } | null> {
        const users = await sql`
            SELECT role FROM users WHERE id = ${userId}
        `;
        return users.length > 0 ? { role: (users[0] as any).role } : null;
    }

    /**
     * Obtiene el nombre completo de un usuario
     */
    static async getUserName(userId: number): Promise<string | null> {
        const users = await sql`
            SELECT full_name FROM users WHERE id = ${userId}
        `;
        return users.length > 0 ? (users[0] as any).full_name : null;
    }

    static async savePushSubscription(userId: number, subscription: any): Promise<void> {
        const { endpoint, keys } = subscription;
        const tags = { userId };

        await sql`
            INSERT INTO push_subscriptions (endpoint, p256dh_key, auth_key, tags)
            VALUES (${endpoint}, ${keys?.p256dh || ''}, ${keys?.auth || ''}, ${JSON.stringify(tags)})
            ON CONFLICT (endpoint) DO UPDATE SET 
                p256dh_key = ${keys?.p256dh || ''},
                auth_key = ${keys?.auth || ''},
                tags = ${JSON.stringify(tags)},
                is_active = true,
                subscribed_at = NOW()
        `;
    }

    /**
     * Detecta si un mensaje contiene palabras clave de soporte
     */
    static detectSupportRequest(query: string): boolean {
        const keywords = ['problema', 'inconveniente', 'error', 'no funciona', 'ayuda', 'reportar', 'fallo', 'bug'];
        const queryLower = query.toLowerCase();
        return keywords.some(kw => queryLower.includes(kw));
    }

    /**
     * Guarda una solicitud de soporte
     */
    static async saveSupportRequest(userId: number, query: string, sessionId?: string): Promise<void> {
        await sql`
            INSERT INTO pse_support_requests (user_id, message, session_id, status)
            VALUES (${userId}, ${query}, ${sessionId || null}, 'pending')
        `;
    }

    /**
     * Obtiene solicitudes de soporte pendientes (para admin)
     */
    static async getSupportRequests(limit: number = 20): Promise<any[]> {
        const requests = await sql`
            SELECT 
                s.id, 
                s.user_id, 
                u.full_name as user_name,
                u.email,
                s.message, 
                s.response_text,
                s.status, 
                s.created_at,
                s.resolved_at
            FROM pse_support_requests s
            LEFT JOIN users u ON s.user_id = u.id
            ORDER BY s.created_at DESC
            LIMIT ${limit}
        `;
        return requests as any[];
    }

    /**
     * Responde a una solicitud de soporte y marca como resuelta.
     */
    static async respondToSupportRequest(requestId: number, responseText: string): Promise<number | null> {
        const result = await sql`
            UPDATE pse_support_requests
            SET response_text = ${responseText},
                status = 'resolved',
                resolved_at = NOW()
            WHERE id = ${requestId}
            RETURNING user_id
        `;
        return result.length > 0 ? (result[0] as any).user_id : null;
    }

    /**
     * Obtiene usuarios en periodo de trial con detalles
     */
    static async getTrialUsers(): Promise<any[]> {
        const users = await sql`
            SELECT 
                u.id,
                u.full_name,
                u.email,
                u.created_at,
                EXTRACT(DAY FROM NOW() - u.created_at)::int as days_since_registration,
                (SELECT COUNT(*) FROM pse_microcycles m 
                 JOIN pse_plans p ON m.plan_id = p.id 
                 WHERE p.user_id = u.id) as microcycles_used
            FROM users u
            LEFT JOIN pse_subscriptions sub ON u.id = sub.user_id AND sub.status = 'active'
            WHERE sub.id IS NULL  -- No tiene suscripción activa
            AND u.created_at > NOW() - INTERVAL '30 days'  -- Registrados en últimos 30 días
            ORDER BY u.created_at DESC
        `;
        return users as any[];
    }

    /**
     * Obtiene el ID de identificación (Cédula) de un atleta.
     */
    static async getAthleteIdNumber(email: string): Promise<string | null> {
        const result = await sql`
            SELECT id_number FROM atletas WHERE email = ${email.toLowerCase()} LIMIT 1
        `;
        return result.length > 0 ? (result[0] as any).id_number : null;
    }

    /**
     * Vincula un ID de identificación (Cédula) a un atleta.
     */
    static async updateAthleteIdNumber(email: string, idNumber: string): Promise<void> {
        await sql`
            UPDATE atletas 
            SET id_number = ${idNumber} 
            WHERE email = ${email.toLowerCase()}
        `;
    }

    /**
     * Busca los registros antropométricos (ISAK) más recientes por Cédula/ID.
     */
    static async getAnthroRecordsByIdNumber(idNumber: string): Promise<any | null> {
        const records = await sql`
            SELECT * FROM anthropometric_records 
            WHERE id_number = ${idNumber}
            ORDER BY date DESC
            LIMIT 1
        `;
        return records.length > 0 ? records[0] : null;
    }

    /**
     * Recupera el entrenamiento actual para el cronómetro.
     */
    static async getCurrentWorkout(userId: number) {
        const plan = await this.getOrCreateActivePlan(userId);
        const lastMicro = await this.getLastMicrocycle(plan.id);
        return lastMicro;
    }
}
