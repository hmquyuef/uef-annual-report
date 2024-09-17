import apiClient from "../apiClient";

export interface UnitItem {
    id: string;
    name: string;
}

export interface UnitsResponse {
    items: UnitItem[];
    totalCount: number;
}

export async function getAllUnits(): Promise<UnitsResponse> {
    const response = await apiClient.get<UnitsResponse>('api/units');
    return response.data;
}