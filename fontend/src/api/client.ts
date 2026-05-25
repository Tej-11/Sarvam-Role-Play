const BASE_URL = "http://localhost:4000/api/v1";

interface ApiOptions extends RequestInit { }

export const apiClient = async <T>(endPoint: string, options: ApiOptions = {}): Promise<T> => {
    try {
    const defaultHeaders: Record<string, string> = options.body instanceof FormData ? {} : { "Content-Type": "application/json" };
    const config: ApiOptions = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...(options.headers as Record<string, string>)
        }
    }
    const response = await fetch(`${BASE_URL}${endPoint}`, config);
    if(!response.ok){
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
    } catch (error) {
        console.error("API Client Error:", error);
        throw error;
    }
}