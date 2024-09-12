import apiClient from "../apiClient";

export interface FaculityItem {
    id: string;
    name: string;
}

export interface FaculitiesResponse {
    items: FaculityItem[];
    totalCount: number;
}

export async function getAllFaculities(): Promise<FaculitiesResponse> {
    const response = await apiClient.get<FaculitiesResponse>('api/faculities');
    return response.data;
}