const BASE_URL = "http://localhost:4000/api/v1";

interface ApiOptions extends RequestInit {
    responseType?: 'json' | 'arraybuffer';
}

export const apiClient = async <T>(endPoint: string, options: ApiOptions = {}): Promise<T> => {
    try {
    const { responseType = 'json', ...fetchOptions } = options;
    const defaultHeaders: Record<string, string> = fetchOptions.body instanceof FormData ? {} : { "Content-Type": "application/json" };
    const config: RequestInit = {
        ...fetchOptions,
        headers: {
            ...defaultHeaders,
            ...(fetchOptions.headers as Record<string, string>)
        }
    }
    const response = await fetch(`${BASE_URL}${endPoint}`, config);
    if(!response.ok){
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    if (responseType === 'arraybuffer') {
        return response.arrayBuffer() as Promise<T>;
    }

    return response.json() as Promise<T>;
    } catch (error) {
        console.error("API Client Error:", error);
        throw error;
    }
}