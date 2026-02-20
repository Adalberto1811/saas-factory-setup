export interface User {
    id: number;
    email: string;
    full_name?: string;
    created_at?: string;
    tenant_id?: string;
    must_change_password?: boolean;
}

export interface Session {
    user: User;
    token: string;
    expiresAt: number;
}
