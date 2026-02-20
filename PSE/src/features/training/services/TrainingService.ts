import { sql } from '@/shared/lib/neon';

export interface TrainingLogEntry {
    userId: number;
    microcycleId: number;
    volumeMeters: number;
    intensityDirection: string;
    seriesData: any;
    durationSeconds: number;
    perceivedExertion?: number;
}

export class TrainingService {
    static async saveLog(log: TrainingLogEntry) {
        return await sql`
      INSERT INTO pse_training_logs (
        user_id, 
        microcycle_id, 
        volume_meters, 
        intensity_direction, 
        series_data, 
        total_duration_seconds,
        perceived_exertion
      ) VALUES (
        ${log.userId}, 
        ${log.microcycleId}, 
        ${log.volumeMeters}, 
        ${log.intensityDirection}, 
        ${JSON.stringify(log.seriesData)}, 
        ${log.durationSeconds},
        ${log.perceivedExertion || null}
      )
      RETURNING id;
    `;
    }

    static async getLogsByUser(userId: number) {
        return await sql`
      SELECT * FROM pse_training_logs 
      WHERE user_id = ${userId} 
      ORDER BY date DESC;
    `;
    }

    static async getStats(userId: number) {
        const stats = await sql`
      SELECT 
        COUNT(*) as total_sessions,
        SUM(volume_meters) as total_volume,
        AVG(perceived_exertion) as avg_exertion
      FROM pse_training_logs
      WHERE user_id = ${userId};
    `;
        return stats[0];
    }
}
