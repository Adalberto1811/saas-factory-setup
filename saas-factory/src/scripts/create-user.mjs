import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from root
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

if (!process.env.DATABASE_URL) {
    console.error("Error: DATABASE_URL not found in .env.local");
    process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function createUser() {
    const email = process.argv[2];
    const password = process.argv[3];
    const fullName = process.argv[4] || 'Admin User';

    if (!email || !password) {
        console.error("Usage: node create-user.mjs <email> <password> [full_name]");
        process.exit(1);
    }

    try {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert user
        const result = await sql`
            INSERT INTO public.users (email, password_hash, full_name, must_change_password)
            VALUES (${email}, ${passwordHash}, ${fullName}, true)
            ON CONFLICT (email) DO UPDATE 
            SET password_hash = EXCLUDED.password_hash,
                full_name = EXCLUDED.full_name,
                must_change_password = true
            RETURNING id, email;
        `;

        console.log(`SUCCESS: User ${result[0].email} created/updated (ID: ${result[0].id})`);
    } catch (error) {
        console.error("Error creating user:", error);
        process.exit(1);
    }
}

createUser();
