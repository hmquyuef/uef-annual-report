import apiClient from "../apiClient";

export interface Menutem {
    id: string;
    name: string;
}

export interface MenusResponse {
    items: Menutem[];
    totalCount: number;
}

export async function getAllMenus(): Promise<MenusResponse> {
    const response = await apiClient.get<MenusResponse>('api/units');
    return response.data;
}