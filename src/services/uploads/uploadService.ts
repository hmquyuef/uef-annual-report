import apiClient from "../apiClient";
import { AxiosResponse } from "axios";

export async function postFiles(data: FormData): Promise<FormData> {
    const response = await apiClient.post<FormData>('api/files/upload', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

export async function deleteFiles(filePath: string): Promise<AxiosResponse<string, unknown>> {
    return await apiClient.delete<string>(`api/files/delete?filePath=${filePath}`);
}