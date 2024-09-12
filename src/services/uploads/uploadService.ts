import apiClient from "../apiClient";

export async function postFiles(data: FormData): Promise<FormData> {
    const response = await apiClient.post<FormData>('api/upload', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}