import apiClient from "../apiClient";

export const columns = [
    { name: "ID", uid: "id"},
    { name: "Họ và tên", uid: "name" },
    { name: "Đơn vị", uid: "unitName" },
    { name: "Số tiết chuẩn", uid: "standard" },
    { name: "Sự kiện", uid: "actions" },
];

export const columnsUserActivities = [
    { uid: "name", label: "Họ và tên", sortable: true },
    { uid: "email", label: "Email"},
    { uid: "unitName", label: "Đơn vị" },
    { uid: "activitiesIds", label: "Số sự kiện" },
];

export interface Users {
    id: string;
    userName: string;
    fullName: string;
    email: string;
    unitName: string;
    standardNumber: number;
    creationTime: number;
    isActived: boolean;
}

export interface UserActivity{
    id: string;
    userName: string;
    fullName: string;
    email: string;
    unitName: string;
    activitiesIds: string[];
}

export interface AddUpdateUsersTable {
    id: string;
    userName: string;
    fullName: string;
    email: string;
    unitName: string;
    standardNumber: number;
}

export interface UsersResponse {
    items: Users[];
    totalCount: number;
}

export interface UsersACtivitiesResponse {
    items: UserActivity[];
    totalCount: number;
}

export async function getListUsers(): Promise<UsersResponse> {
    const response = await apiClient.get<UsersResponse>('api/users?PageSizes=9999');
    return response.data;
}

export async function getUsers(code: string): Promise<UsersResponse> {
    const response = await apiClient.get<UsersResponse>(`api/users?Filters=${code}`);
    return response.data;
}

export async function getUsersActivities(activityId: string): Promise<UsersACtivitiesResponse> {
    const response = await apiClient.get<UsersACtivitiesResponse>(activityId !== "" ? `api/users/activity?activityId=${activityId}` : "api/users/activity");
    return response.data;
}