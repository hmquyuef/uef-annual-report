import apiClient from "../apiClient";
// import apiClientFomHRM from "../apiClientFomHRM";

export interface UnitItem {
    id: string;
    name: string;
}

export interface UnitHRMItem {
    id: string;
    code: string;
    name: string;
}

export interface UnitsResponse {
    items: UnitItem[];
    totalCount: number;
}

export interface UnitsHRMResponse {
    model: UnitHRMItem[];
}

export async function getAllUnits(): Promise<UnitsResponse> {
    const response = await apiClient.get<UnitsResponse>('api/units');
    return response.data;
}

export async function getListUnitsFromHrm(): Promise<UnitsHRMResponse> {
    const response = await apiClient.get<UnitsHRMResponse>('api/units/hrm');
    return response.data;
}