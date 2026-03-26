import { handlers } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

export const runtime = 'nodejs'

const { GET: authGET, POST: authPOST } = handlers

export async function GET(req: NextRequest) {
    try {
        return await authGET(req)
    } catch (error: any) {
        console.error("NextAuth [GET] Crash:", error)
        // Solo para debugging de la fase de deploy actual
        return NextResponse.json({ 
            error: "Auth execution failed", 
            message: error.message,
            reqUrl: req.url,
            authUrl: process.env.AUTH_URL
        }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        return await authPOST(req)
    } catch (error: any) {
        console.error("NextAuth [POST] Crash:", error)
        return NextResponse.json({ 
            error: "Auth execution failed", 
            message: error.message,
            reqUrl: req.url,
            authUrl: process.env.AUTH_URL
        }, { status: 500 })
    }
}
