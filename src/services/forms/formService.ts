import apiClient from "@/services/apiClient";

export interface ActivityItem {
    id: string;
    name: string;
    workloadTypeId: string;
    workloadTypeName: string;
    determinations: Determinations;
    attendance: Attendance
    participants: Participation[];
    description: string;
    creationTime: number;
    isActived: boolean;
}

export interface Attendance {
    fromDate: number;
    toDate: number;
}

export interface Determinations {
    number: string;
    time: number;
    pathImg: string;
}

export interface Participation {
    id: string;
    fullName: string;
    unitId: string;
    unitName: number;
    standardNumber: number;
}

export interface AddUpdateActivityItem {
    id?: string;
    name: string;
    workloadTypeId: string;
    determinations: Determinations;
    attendance: Attendance
    participants: ActivityInput[];
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
    { uid: "name", label: "Tên hoạt động", sortable: true },
    { uid: "workloadTypeName", label: "Thuộc loại biểu mẫu" },
    { uid: "attendance", label: "Thời gian tham dự" },
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