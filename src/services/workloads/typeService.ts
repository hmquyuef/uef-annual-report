import apiClient from "@/services/apiClient";

export interface WorkloadTypeItem {
    id: string;
    name: string;
    workloadGroupId: string;
    groupName: string;
    creationTime: number;
    isActived: boolean;
}

export interface AddUpdateWorkloadType {
    name: string;
    workloadGroupId: string;
    isActived: boolean;
}

export interface WorkloadTypesResponse {
    items: WorkloadTypeItem[];
    totalCount: number;
}

export const columns = [
    { uid: "name", label: "Tên", sortable: true },
    { uid: "groupName", label: "Nhóm công tác" },
    { uid: "creationTime", label: "Ngày khởi tạo", sortable: true },
    { uid: "isActive", label: "Trạng thái" },
];

export async function getWorkloadTypes(): Promise<WorkloadTypesResponse> {
    const response = await apiClient.get<WorkloadTypesResponse>('api/workload/types');
    return response.data;
}

export async function getWorkloadTypeById(id: string): Promise<WorkloadTypeItem> {
    const response = await apiClient.get<WorkloadTypeItem>(`api/workload/types/${id}`);
    return response.data;
}

export async function postAddWorkloadType(data: Partial<AddUpdateWorkloadType>): Promise<AddUpdateWorkloadType> {
    const response = await apiClient.post<AddUpdateWorkloadType>('api/workload/types', data);
    return response.data;
}

export async function putUpdateWorkloadType(id: string, data: Partial<AddUpdateWorkloadType>): Promise<AddUpdateWorkloadType> {
    const response = await apiClient.put<AddUpdateWorkloadType>(`api/workload/types/${id}`, data);
    return response.data;
}

export async function deleteWorkloadTypes(ids: string[]): Promise<void> {
    await apiClient.delete('api/workload/types', {
        data: ids
    });
}