import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export default NextAuth(authConfig).auth((req: any) => {
    // Session is handled by authConfig.callbacks.authorized
})

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

