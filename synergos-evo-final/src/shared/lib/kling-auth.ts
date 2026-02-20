import * as jose from 'jose';

const KLING_API_KEY = process.env.KLING_API_KEY || '';
const KLING_ACCESS_KEY = process.env.KLING_ACCESS_KEY || '';
const KLING_SECRET_KEY = process.env.KLING_SECRET_KEY || '';

/**
 * Generates a JWT token for Kling AI API authentication
 * Based on AK/SK authentication method
 */
export async function getKlingToken() {
    // If a direct API key is provided, use it
    if (KLING_API_KEY) return KLING_API_KEY;

    // If AK/SK are provided, generate a dynamic JWT
    if (KLING_ACCESS_KEY && KLING_SECRET_KEY) {
        try {
            const secret = new TextEncoder().encode(KLING_SECRET_KEY);
            const token = await new jose.SignJWT({ iss: KLING_ACCESS_KEY })
                .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
                .setIssuedAt()
                .setExpirationTime('30m')
                .sign(secret);
            return token;
        } catch (error) {
            console.error('Error generating Kling token:', error);
            return null;
        }
    }

    return null;
}
