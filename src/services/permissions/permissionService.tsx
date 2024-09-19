import apiClient from "../apiClient";

export interface Roletem {
    id: string;
    name: string;
}

export interface Permissiontem {
    id: string;
    userName: string;
    fullName: string;
    email: string;
    roles: Roletem[];
}

export interface PermissionsResponse {
    items: Permissiontem[];
}

export async function getAllPermissions(code: string): Promise<PermissionsResponse> {
    const response = await apiClient.get<PermissionsResponse>(`api/permission?Filters=${code}`);
    return response.data;
}