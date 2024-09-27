import apiClient from "../apiClient";

export interface DataExport {
    stt: number;
    userName: string;
    middleName: string;
    firstName: string;
    faculityName: string;
    activityName: string;
    standNumber: number;
    determination: string;
    note: string;
}

export interface ExportResponse {
    unitName: string;
    data: DataExport[];
}

export async function getDataExportById(id: string): Promise<ExportResponse> {
    const response = await apiClient.get<ExportResponse>(`api/export/${id}`);
    return response.data;
}