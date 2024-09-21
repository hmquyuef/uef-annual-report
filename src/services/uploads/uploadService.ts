import apiClient from "../apiClient";
import { AxiosResponse } from "axios";

export interface FileItem {
    type: string;
    path: string;
    name: string;
    size: number;
}

export async function postFiles(data: FormData): Promise<FileItem[]> {
    const response = await apiClient.post<FileItem[]>('api/files/upload', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

export async function deleteFiles(filePath: string): Promise<AxiosResponse<string, unknown>> {
    return await apiClient.delete<string>(`api/files/delete?filePath=${filePath}`);
}