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
            const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
            console.error('API Error:', errorData);
            throw new Error(errorMessage);
        } else {
            const text = await response.text();
            console.error('Non-JSON Error Response:', text);
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

    // Bitdefender API Methods (Sync)
    bitdefenderAPI: {
        syncClient: (clientId: number) => request('/app_bitdefender_sync_client.php', { 
            method: 'POST', 
            body: JSON.stringify({ clientId: clientId }) 
        }),
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

    // Audit Log Methods
    audit: {
        list: (params?: { page?: number; limit?: number; user_id?: number; action?: string; table_name?: string; date_from?: string; date_to?: string }) => {
            const queryParams = new URLSearchParams();
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined) queryParams.append(key, String(value));
                });
            }
            return request(`/app_audit.php?${queryParams.toString()}`);
        },
        create: (data: { action: string; table_name: string; record_id?: number; old_values?: any; new_values?: any }) =>
            request('/app_audit.php', { method: 'POST', body: JSON.stringify(data) }),
    },

    // Notifications Methods
    notifications: {
        list: (unread?: boolean) => request(`/app_notifications.php?action=list${unread ? '&unread=true' : ''}`),
        unreadCount: () => request('/app_notifications.php?action=unread_count'),
        settings: () => request('/app_notifications.php?action=settings'),
        create: (data: { type: string; title: string; message?: string; related_table?: string; related_id?: number; priority?: string }) =>
            request('/app_notifications.php', { method: 'POST', body: JSON.stringify(data) }),
        markAsRead: (id: number) => request('/app_notifications.php?action=mark_read', { method: 'PUT', body: JSON.stringify({ id }) }),
        markAllAsRead: () => request('/app_notifications.php?action=mark_all_read', { method: 'PUT' }),
        updateSettings: (data: any) => request('/app_notifications.php?action=settings', { method: 'PUT', body: JSON.stringify(data) }),
        remove: (id: number) => request(`/app_notifications.php?id=${id}`, { method: 'DELETE' }),
    },

    // Bitdefender Endpoints Methods
    endpoints: {
        list: (params?: { client_id?: number; protection_status?: string }) => {
            const queryParams = new URLSearchParams({ action: 'list' });
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined) queryParams.append(key, String(value));
                });
            }
            return request(`/app_bitdefender_endpoints.php?${queryParams.toString()}`);
        },
        stats: () => request('/app_bitdefender_endpoints.php?action=stats'),
        sync: (clientId?: number) => {
            if (clientId) {
                return request('/app_bitdefender_endpoints.php', { 
                    method: 'POST', 
                    body: JSON.stringify({ client_id: clientId }) 
                });
            }
            return request('/app_bitdefender_endpoints.php?action=sync');
        },
        update: (id: number, data: { hardware_id?: number; is_managed?: boolean }) =>
            request(`/app_bitdefender_endpoints.php?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        remove: (id: number) => request(`/app_bitdefender_endpoints.php?id=${id}`, { method: 'DELETE' }),
    },

    // Contracts Methods
    contracts: {
        list: (params?: { status?: string; service_type?: string; client_name?: string }) => {
            const queryParams = new URLSearchParams({ action: 'list' });
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined) queryParams.append(key, String(value));
                });
            }
            return request(`/app_contracts.php?${queryParams.toString()}`);
        },
        stats: () => request('/app_contracts.php?action=stats'),
        renewals: (contractId?: number) => {
            const url = contractId 
                ? `/app_contracts.php?action=renewals&contract_id=${contractId}`
                : '/app_contracts.php?action=renewals';
            return request(url);
        },
        expiring: (days: number = 30) => request(`/app_contracts.php?action=expiring&days=${days}`),
        create: (data: any) => request('/app_contracts.php?action=create', { method: 'POST', body: JSON.stringify(data) }),
        createRenewal: (data: any) => request('/app_contracts.php?action=renewal', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: number, data: any) => request(`/app_contracts.php?id=${id}&action=update`, { method: 'PUT', body: JSON.stringify(data) }),
        updateRenewal: (id: number, data: any) => request(`/app_contracts.php?id=${id}&action=renewal`, { method: 'PUT', body: JSON.stringify(data) }),
        remove: (id: number) => request(`/app_contracts.php?id=${id}`, { method: 'DELETE' }),
    },

    // FortiGate API Methods
    fortigateAPI: {
        getConfig: (deviceId: number) => request(`/app_fortigate_api.php?action=get_config&device_id=${deviceId}`),
        saveConfig: (data: { device_id: number; api_ip: string; api_token: string; api_port?: number; verify_ssl?: boolean; sync_interval?: number }) =>
            request('/app_fortigate_api.php?action=save_config', { method: 'POST', body: JSON.stringify(data) }),
        testConnection: (deviceId: number) =>
            request('/app_fortigate_api.php?action=test_connection', { method: 'POST', body: JSON.stringify({ device_id: deviceId }) }),
        syncDevice: (deviceId: number) =>
            request('/app_fortigate_api.php?action=sync_device', { method: 'POST', body: JSON.stringify({ device_id: deviceId }) }),
        syncAll: () => request('/app_fortigate_api.php?action=sync_all', { method: 'POST' }),
        getHistory: (deviceId: number, limit?: number) => {
            const url = limit 
                ? `/app_fortigate_api.php?action=get_history&device_id=${deviceId}&limit=${limit}`
                : `/app_fortigate_api.php?action=get_history&device_id=${deviceId}`;
            return request(url);
        },
        getExtendedData: (deviceId: number) => request(`/app_fortigate_api.php?action=get_extended_data&device_id=${deviceId}`),
        getAlerts: (params?: { device_id?: number; unread_only?: boolean; limit?: number }) => {
            const queryParams = new URLSearchParams({ action: 'get_alerts' });
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined) queryParams.append(key, String(value));
                });
            }
            return request(`/app_fortigate_api.php?${queryParams.toString()}`);
        },
        resolveAlert: (alertId: number) =>
            request('/app_fortigate_api.php?action=resolve_alert', { method: 'POST', body: JSON.stringify({ alert_id: alertId }) }),
        deleteConfig: (deviceId: number) => request(`/app_fortigate_api.php?action=delete_config&device_id=${deviceId}`, { method: 'DELETE' }),
        getStats: () => request('/app_fortigate_api.php?action=get_stats'),
    },
};
