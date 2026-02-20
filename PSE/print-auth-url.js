// Script para agregar variable de entorno a Vercel sin caracteres extra
const { execSync } = require('child_process');

const AUTH_URL = 'https://performanceswimming.online/performance/api/auth';
const NEXTAUTH_URL = 'https://performanceswimming.online/performance/api/auth';

// Crear archivo temporal sin newlines usando fs
const fs = require('fs');

// Escribir AUTH_URL
process.stdout.write(AUTH_URL);
