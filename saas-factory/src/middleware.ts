import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export default NextAuth(authConfig).auth

export const config = {
    // Matcher ensuring middleware runs on relevant paths but ignores static/api
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
