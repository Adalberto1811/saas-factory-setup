import fs from 'fs';
import path from 'path';

const memoryPath = path.resolve(__dirname, '../memory/long_term_memory.json');

/**
 * Inicializa el archivo de memoria si no existe
 */
export const initDatabase = async () => {
    if (!fs.existsSync(path.dirname(memoryPath))) {
        fs.mkdirSync(path.dirname(memoryPath), { recursive: true });
    }
    if (!fs.existsSync(memoryPath)) {
        fs.writeFileSync(memoryPath, JSON.stringify([]));
    }
    console.log('✅ Memoria Inmortal (Local JSON) vinculada.');
};

/**
 * Guarda un mensaje en la memoria inmortal
 */
export const saveMemory = async (userId: number, role: string, content: string) => {
    try {
        const memory = JSON.parse(fs.readFileSync(memoryPath, 'utf-8'));
        memory.push({ userId, role, content, timestamp: new Date().toISOString() });
        // Limitar a los últimos 1000 mensajes para no saturar el archivo
        if (memory.length > 1000) memory.shift();
        fs.writeFileSync(memoryPath, JSON.stringify(memory, null, 2));
    } catch (err) {
        console.error('❌ Error guardando en memoria Local:', err);
    }
};

/**
 * Recupera el contexto histórico relevante
 */
export const getHistory = async (userId: number, limit: number = 20) => {
    try {
        const memory = JSON.parse(fs.readFileSync(memoryPath, 'utf-8'));
        return memory
            .filter((m: any) => m.userId === userId)
            .slice(-limit)
            .map((m: any) => ({ role: m.role, content: m.content }));
    } catch (err) {
        console.error('❌ Error recuperando memoria Local:', err);
        return [];
    }
};
