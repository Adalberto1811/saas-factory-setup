import { handlers } from "@/auth"

// Changed from 'edge' to 'nodejs' - Auth.js v5 has issues with edge runtime
export const runtime = 'nodejs'

export const { GET, POST } = handlers
