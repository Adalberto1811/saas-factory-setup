import fs from 'fs';
import path from 'path';

const SKILLS_DIR = path.resolve(__dirname, '../../saas-factory/.claude/skills'); // Ruta a la biblioteca de la fábrica
const LOCAL_SKILLS_DIR = path.resolve(__dirname, '../skills');

/**
 * Busca y activa una habilidad (skill) localmente
 */
export async function findAndActivateSkill(skillName: string): Promise<string> {
    const paths = [
        path.join(SKILLS_DIR, skillName, 'SKILL.md'),
        path.join(LOCAL_SKILLS_DIR, skillName, 'SKILL.md')
    ];

    for (const skillPath of paths) {
        if (fs.existsSync(skillPath)) {
            const content = fs.readFileSync(skillPath, 'utf-8');
            return `✅ Skill "${skillName}" encontrada.\n\n📖 **Resumen del Manual:**\n${content.substring(0, 800)}...`;
        }
    }

    return `❌ Skill "${skillName}" no encontrada en la biblioteca de la fábrica ni local.`;
}

/**
 * Lista todas las habilidades disponibles
 */
export function listAvailableSkills(): string {
    const factorySkills = fs.existsSync(SKILLS_DIR) ? fs.readdirSync(SKILLS_DIR) : [];
    const localSkills = fs.existsSync(LOCAL_SKILLS_DIR) ? fs.readdirSync(LOCAL_SKILLS_DIR) : [];

    const all = [...new Set([...factorySkills, ...localSkills])].filter(s => !s.startsWith('.'));

    return `📚 **Biblioteca de Habilidades (${all.length}):**\n\n${all.map(s => `- \`${s}\``).join('\n')}`;
}

/**
 * Crea una nueva habilidad (skill) vacía
 */
export async function createNewSkill(skillName: string, description: string): Promise<string> {
    const newSkillDir = path.join(LOCAL_SKILLS_DIR, skillName);
    if (!fs.existsSync(newSkillDir)) {
        fs.mkdirSync(newSkillDir, { recursive: true });
        const skillTemplate = `---
name: ${skillName}
description: ${description}
---

# ${skillName}

## Instrucciones de Operación (Socio Boss)
- [Paso 1: Definir el workflow]
- [Paso 2: Ejecutar comandos]
`;
        fs.writeFileSync(path.join(newSkillDir, 'SKILL.md'), skillTemplate);
        return `✅ Nueva Skill "${skillName}" creada y lista para ser programada.`;
    }
    return `⚠️ La Skill "${skillName}" ya existe en tus módulos locales.`;
}
