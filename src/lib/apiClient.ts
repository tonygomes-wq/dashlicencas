// src/lib/apiClient.ts - Native Fetch Client for PHP Backend

const API_BASE_URL = '.'; // API points to the root directory

const request = async (path: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = { ...options.headers as Record<string, string> };

    if (options.body && !headers['Content-Type']) {
        if (typeof options.body === 'string') {
            headers['Content-Type'] = 'application/json';
        }
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
        if (isJson) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        } else {
            const text = await response.text();
            if (text.includes('<!doctype') || text.includes('<html')) {
                throw new Error(`Erro no Servidor (HTML recebido em vez de JSON). Status: ${response.status}. Por favor, limpe o cache do navegador.`);
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    }

    if (!isJson) {
        const text = await response.text();
        if (text.includes('<!doctype') || text.includes('<html')) {
            throw new Error(`Resposta inválida do servidor (HTML em vez de JSON). Por favor, limpe o cache do navegador (Ctrl+F5).`);
        }
    }

    return response.json();
};

export const apiClient = {
    // Auth Methods
    auth: {
        login: (credentials: { email: string; password: any }) => {
            const params = new URLSearchParams();
            params.append('email', credentials.email);
            params.append('password', credentials.password);

            return request('/app_auth.php?do=login', {
                method: 'POST',
                body: params,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        },
        logout: () => request('/app_auth.php?do=logout'),
        checkSession: () => request('/app_auth.php?do=check'),
        verify2FA: (code: string) => request('/app_v2fa.php', {
            method: 'POST',
            body: JSON.stringify({ code })
        }),
        setup2FA: () => request('/app_e2fa.php?do=setup'),
        confirm2FA: (code: string) => request('/app_e2fa.php?do=confirm', {
            method: 'POST',
            body: JSON.stringify({ code })
        }),
        disable2FA: () => request('/app_e2fa.php?do=disable', { method: 'POST' }),
    },

    // Bitdefender Methods
    bitdefender: {
        list: () => request('/app_bitdefender.php'),
        create: (data: any) => request('/app_bitdefender.php', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: number, data: any) => request(`/app_bitdefender.php?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        remove: (id: number) => request(`/app_bitdefender.php?id=${id}`, { method: 'DELETE' }),
        bulkRemove: (ids: number[]) => request('/app_bitdefender.php', { method: 'DELETE', body: JSON.stringify({ ids }) }),
    },

    // Fortigate Methods
    fortigate: {
        list: () => request('/app_fortigate.php'),
        create: (data: any) => request('/app_fortigate.php', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: number, data: any) => request(`/app_fortigate.php?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        remove: (id: number) => request(`/app_fortigate.php?id=${id}`, { method: 'DELETE' }),
        bulkRemove: (ids: number[]) => request('/app_fortigate.php', { method: 'DELETE', body: JSON.stringify({ ids }) }),
    },

    // O365 Methods
    o365: {
        clients: {
            list: () => request('/app_o365.php?type=clients'),
            create: (data: any) => request('/app_o365.php?type=clients', { method: 'POST', body: JSON.stringify(data) }),
            createWithLicenses: (client: any, licenses: any[]) => request('/app_o365.php?type=clients&do=create_with_licenses', {
                method: 'POST',
                body: JSON.stringify({ client, licenses })
            }),
            update: (id: string, data: any) => request(`/app_o365.php?type=clients&id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
            remove: (id: string) => request(`/app_o365.php?type=clients&id=${id}`, { method: 'DELETE' }),
        },
        licenses: {
            list: () => request('/app_o365.php?type=licenses'),
            create: (data: any) => request('/app_o365.php?type=licenses', { method: 'POST', body: JSON.stringify(data) }),
            bulkCreate: (licenses: any[]) => request('/app_o365.php?type=licenses&do=bulk_create', {
                method: 'POST',
                body: JSON.stringify({ licenses })
            }),
            update: (id: number, data: any) => request(`/app_o365.php?type=licenses&id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
            remove: (id: number) => request(`/app_o365.php?type=licenses&id=${id}`, { method: 'DELETE' }),
            bulkRemove: (ids: number[]) => request('/app_o365.php?type=licenses', { method: 'DELETE', body: JSON.stringify({ ids }) }),
        }
    },

    // Gmail Methods
    gmail: {
        clients: {
            list: () => request('/app_gmail.php?type=clients'),
            create: (data: any) => request('/app_gmail.php?type=clients', { method: 'POST', body: JSON.stringify(data) }),
            createWithLicenses: (client: any, licenses: any[]) => request('/app_gmail.php?type=clients&do=create_with_licenses', {
                method: 'POST',
                body: JSON.stringify({ client, licenses })
            }),
            update: (id: string, data: any) => request(`/app_gmail.php?type=clients&id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
            remove: (id: string) => request(`/app_gmail.php?type=clients&id=${id}`, { method: 'DELETE' }),
        },
        licenses: {
            list: () => request('/app_gmail.php?type=licenses'),
            create: (data: any) => request('/app_gmail.php?type=licenses', { method: 'POST', body: JSON.stringify(data) }),
            bulkCreate: (licenses: any[]) => request('/app_gmail.php?type=licenses&do=bulk_create', {
                method: 'POST',
                body: JSON.stringify({ licenses })
            }),
            update: (id: number, data: any) => request(`/app_gmail.php?type=licenses&id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
            remove: (id: number) => request(`/app_gmail.php?type=licenses&id=${id}`, { method: 'DELETE' }),
            bulkRemove: (ids: number[]) => request('/app_gmail.php?type=licenses', { method: 'DELETE', body: JSON.stringify({ ids }) }),
        }
    },

    // User Management Methods (Admin only)
    users: {
        list: () => request('/app_users.php?do=list'),
        get: (id: number) => request(`/app_users.php?do=get&id=${id}`),
        create: (data: { email: string; password: string; role?: string; is_active?: boolean }) =>
            request('/app_users.php?do=create', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: number, data: { email?: string; password?: string; role?: string; is_active?: boolean }) =>
            request(`/app_users.php?do=update&id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        remove: (id: number) => request(`/app_users.php?do=delete&id=${id}`, { method: 'DELETE' }),
    },

    // Email sending
    sendEmails: {
        send: (payload: { itemIds: string[]; subject: string; body: string }) =>
            request('/app_send_emails.php', { method: 'POST', body: JSON.stringify(payload) }),
    },
    diagrams: {
        list: () => request('/app_diagrams.php'),
        get: (id: number) => request(`/app_diagrams.php?id=${id}`),
        save: (data: any) => request('/app_diagrams.php', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        remove: (id: number) => request(`/app_diagrams.php?id=${id}`, { method: 'DELETE' }),
    },

    // Hardware Inventory Methods
    hardware: {
        list: () => request('/app_hardware.php'),
        get: (id: number) => request(`/app_hardware.php?id=${id}`),
        create: (data: any) => request('/app_hardware.php', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: number, data: any) => request(`/app_hardware.php?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        remove: (id: number) => request(`/app_hardware.php?id=${id}`, { method: 'DELETE' }),
        bulkRemove: (ids: number[]) => request('/app_hardware.php', { method: 'DELETE', body: JSON.stringify({ ids }) }),
    },
};
