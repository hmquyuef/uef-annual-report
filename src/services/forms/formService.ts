import apiClient from "@/services/apiClient";

export interface ActivityItem {
    id: string;
    stt: number;
    name: string;
    workloadTypeId: string;
    workloadTypeName: string;
    determinations: Determinations;
    participants: Participation[];
    description: string;
    documentNumber: string;
    creationTime: number;
    isActived: boolean;
}

export interface Determinations {
    number: string;
    fromDate: number;
    entryDate: number;
    file: InfoFile;
}

export interface InfoFile{
    type: string;
    path: string;
    name: string;
    size: number;
}

export interface Participation {
    id: string;
    userName: string;
    fullName: string;
    unitId: string;
    unitName: number;
    standardNumber: number;
}

export interface AddUpdateActivityItem {
    id?: string;
    stt: number;
    name: string;
    workloadTypeId: string;
    determinations: Determinations;
    participants: ActivityInput[];
    documentNumber: string;
    description: string;
}

export interface ActivityInput{
    id: string;
    userName: string;
    fullName: string;
    unitName: string;
    standardNumber: number;
}

export interface ActivitiesResponse {
    items: ActivityItem[];
    totalCount: number;
}

export const columns = [
    { uid: "stt", label: "STT"},
    { uid: "workloadTypeName", label: "Loại biểu mẫu" },
    { uid: "name", label: "Tên hoạt động đã thực hiện"},
    { uid: "attendance", label: "Ngày ký" },
    { uid: "determination", label: "Minh chứng" },
    { uid: "number", label: "Số VBHC" },
    { uid: "determinationsTime", label: "Ngày nhập"},
    { uid: "description", label: "Ghi chú" },
    // { uid: "actions", label: "Sự kiện" },
];

export async function getAllActivities(): Promise<ActivitiesResponse> {
    const response = await apiClient.get<ActivitiesResponse>('api/activities');
    return response.data;
}

export async function getActivityById(id: string): Promise<ActivityItem> {
    const response = await apiClient.get<ActivityItem>(`api/activities/${id}`);
    return response.data;
}

export async function postAddActivity(data: Partial<AddUpdateActivityItem>): Promise<AddUpdateActivityItem> {
    const response = await apiClient.post<AddUpdateActivityItem>('api/activities', data);
    return response.data;
}

export async function putUpdateActivity(id: string, data: Partial<AddUpdateActivityItem>): Promise<AddUpdateActivityItem> {
    const response = await apiClient.put<AddUpdateActivityItem>(`api/activities/${id}`, data);
    return response.data;
}

export async function deleteActivities(ids: string[]): Promise<void> {
    await apiClient.delete('api/activities', {
        data: ids
    });
}