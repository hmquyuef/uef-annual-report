import apiClient from "@/services/apiClient";

export const columns = [
    { name: "ID", uid: "id"},
    { name: "Vai trò", uid: "name" },
    { name: "Ứng dụng", uid: "appName" },
    { name: "Trạng thái", uid: "isActived" },
    { name: "Ngày khởi tạo", uid: "creationTime" },
];

export interface RoleItem {
    id: string;
    name: string;
    appId: string;
    appName: string;
    isActived: boolean;
    creationTime: number;
}

export interface RolesResponse {
    items: RoleItem[];
    totalCount: number;
}

export async function getAllRoles(): Promise<RolesResponse> {
    const response = await apiClient.get<RolesResponse>('api/roles');
    return response.data;
}