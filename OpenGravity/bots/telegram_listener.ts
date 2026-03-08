import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import path from 'path';
import { think } from '../lib/brain';
import { initDatabase, saveMemory } from '../lib/database';
import { listAvailableSkills, findAndActivateSkill } from '../lib/skill-manager';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const token = process.env.TELEGRAM_BOT_TOKEN;
const whitelistId = parseInt(process.env.TELEGRAM_WHITELIST_ID || '0', 10);

if (!token || !whitelistId) {
    console.error('❌ ERROR: Configuración incompleta en .env');
    process.exit(1);
}

// Inicializar DB (Memoria Inmortal)
initDatabase();

// Inicializar el bot
const bot = new TelegramBot(token, { polling: true });

console.log('🌌 Socio Boss - Nodo de Inteligencia Operativo');
console.log(`🛡️  Seguridad Whitelist: Solo RESPONDIENDO al User ID [${whitelistId}]`);

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    const userName = msg.from?.username || 'Boss';

    // Filtro de seguridad máximo
    if (userId === undefined || userId !== whitelistId) {
        if (userId) console.warn(`⚠️ Intento bloqueado de User ID ${userId}`);
        return;
    }

    const text = msg.text || '';

    // COMANDOS DE SOCIO BOSS
    if (text === '/start') {
        bot.sendMessage(chatId, `🤖 **Socio Boss Operativo.** \n\nSoy tu IA de confianza conectada a la Fábrica. \n\nComandos rápidos:\n/skills - Ver mis habilidades\n/start - Reiniciar sesión actual`, { parse_mode: 'Markdown' });
        return;
    }

    if (text === '/skills') {
        const skillsList = listAvailableSkills();
        bot.sendMessage(chatId, skillsList, { parse_mode: 'Markdown' });
        return;
    }

    if (text.startsWith('/skill ')) {
        const skillName = text.replace('/skill ', '').trim();
        const res = await findAndActivateSkill(skillName);
        bot.sendMessage(chatId, res, { parse_mode: 'Markdown' });
        return;
    }

    // PROCESAMIENTO INTELIGENTE
    bot.sendChatAction(chatId, 'typing');

    try {
        // 1. Persistir en Memoria Inmortal
        await saveMemory(userId, 'user', text);

        // 2. Ejecutar pensamiento con historia
        const response = await think(text, userId);

        // 3. Persistir respuesta
        await saveMemory(userId, 'assistant', response);

        // Enviar al Socio con blindaje de errores
        try {
            await bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
        } catch (error) {
            await bot.sendMessage(chatId, response);
        }
    } catch (err) {
        console.error("Error thinking:", err);
        bot.sendMessage(chatId, "⚠️ Socio, surgió un error en mi procesamiento neuronal. Revisa la terminal.");
    }
});
