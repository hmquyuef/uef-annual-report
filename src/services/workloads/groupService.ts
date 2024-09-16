import apiClient from "@/services/apiClient";

export interface WorkloadGroupItem {
    id: string;
    name: string;
    description: string;
    creationTime: number;
    isActived: boolean;
}

export interface AddWordloadGroup {
    name: string;
    description: string;
    isActived: boolean;
}

export interface WorkloadGroupResponse {
    items: WorkloadGroupItem[];
    totalCount: number;
}

export const columns = [
    { uid: "name", label: "Tên", sortable: true },
    { uid: "description", label: "Mô tả" },
    { uid: "creationTime", label: "Ngày khởi tạo", sortable: true },
    { uid: "isActive", label: "Trạng thái" },
];

export async function getWorkloadGroups(): Promise<WorkloadGroupResponse> {
    const response = await apiClient.get<WorkloadGroupResponse>('api/workload/groups');
    return response.data;
}

export async function postAddWorkloadGroup(data: Partial<AddWordloadGroup>): Promise<AddWordloadGroup> {
    const response = await apiClient.post<AddWordloadGroup>('api/workload/groups', data);
    return response.data;
}

export async function putUpdateWorkloadGroup(id: string, data: Partial<AddWordloadGroup>): Promise<AddWordloadGroup> {
    const response = await apiClient.put<AddWordloadGroup>(`api/workload/groups/${id}`, data);
    return response.data;
}

export async function deleteWorkloadGroup(ids: string[]): Promise<void> {
    await apiClient.delete('api/workload/groups', {
        data: ids
    });
}