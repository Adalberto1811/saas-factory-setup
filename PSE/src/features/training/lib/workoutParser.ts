/**
 * workoutParser.ts
 * Motor de decodificación de planes del Coach Alvin (PSE)
 * 
 * Capaz de parsear estructuras como:
 * "II-. 4x100m haciendo 1:20 con 20s de descanso = 400m"
 */

export interface WorkoutStep {
    id: string;
    type: 'warmup' | 'main' | 'cooldown';
    repetitions: number;
    distance: number;
    targetTime?: string; // e.g., "1:20"
    restSeconds: number;
    description: string;
    totalDistance: number;
}

export interface WorkoutSession {
    day: string;
    totalVolume: number;
    direction: string;
    steps: WorkoutStep[];
}

export function parseWorkout(markdown: string): WorkoutSession[] {
    const sessions: WorkoutSession[] = [];

    // Separar por días (DÍA Lunes, DÍA Martes, etc.)
    const dayBlocks = markdown.split(/\n\*\*\[D[ÍI]A\]/i).slice(1);

    for (const block of dayBlocks) {
        const lines = block.split('\n');
        const headerLine = lines[0];

        // Extraer volumen y dirección del encabezado
        // Ejemplo: " Lunes 16 de Febrero. 2.4km. Dirección: AL/AM"
        const volumeMatch = headerLine.match(/(\d+(?:\.\d+)?)km/i);
        const directionMatch = headerLine.match(/Dirección:\s*([^\s\*]+)/i);
        const dayMatch = headerLine.match(/^\s*([^\.]+)/i);

        const steps: WorkoutStep[] = [];

        // Parsear líneas de series (I-., II-., III-.)
        // Regex para detectar: [Repeticiones]x[Distancia]m [haciendo Tiempo] [con Descanso]
        const seriesRegex = /(?:[I]+-\.\s*)?(\d+)\s*[x×*]\s*(\d+)m(?:\s+haciendo\s+([\d:]+))?(?:\s+con\s+(\d+)\s*[s"”]|(?:\s+con\s+(\d+)\s*[m'’]))?/i;

        lines.forEach((line, index) => {
            const match = line.match(seriesRegex);
            if (match) {
                const reps = parseInt(match[1]);
                const dist = parseInt(match[2]);
                const target = match[3];

                // Manejar segundos o minutos de descanso
                let rest = 0;
                if (match[4]) rest = parseInt(match[4]); // segundos
                if (match[5]) rest = parseInt(match[5]) * 60; // minutos

                // Especial para PAE2: Si el texto dice "3 minutos", forzarlo
                if (line.toLowerCase().includes('3 minutos')) rest = 180;

                steps.push({
                    id: `step-${sessions.length}-${steps.length}`,
                    type: line.includes('I-.') ? 'warmup' : line.includes('III-.') ? 'cooldown' : 'main',
                    repetitions: reps,
                    distance: dist,
                    targetTime: target,
                    restSeconds: rest,
                    description: line.trim(),
                    totalDistance: reps * dist
                });
            }
        });

        if (steps.length > 0) {
            sessions.push({
                day: dayMatch ? dayMatch[1].trim() : 'Sin día',
                totalVolume: volumeMatch ? parseFloat(volumeMatch[1]) : 0,
                direction: directionMatch ? directionMatch[1].trim() : 'Desconocida',
                steps
            });
        }
    }

    return sessions;
}
