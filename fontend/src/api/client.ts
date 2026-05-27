const BASE_URL =  process.env.REACT_APP_API_BASE_URL || "http://localhost:4000/api/v1";
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

export const streamingApiClient = async function* <T>(
    endPoint: string,
    options: ApiOptions = {}
): AsyncGenerator<T> {
    try {
        const { ...fetchOptions } = options;
        const defaultHeaders: Record<string, string> = fetchOptions.body instanceof FormData ? {} : { "Content-Type": "application/json" };
        const config: RequestInit = {
            ...fetchOptions,
            headers: {
                ...defaultHeaders,
                ...(fetchOptions.headers as Record<string, string>)
            }
        };

        const response = await fetch(`${BASE_URL}${endPoint}`, config);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
            throw new Error("Response body is not readable");
        }

        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const messages = buffer.split('\n\n');

            for (let i = 0; i < messages.length - 1; i++) {
                const message = messages[i].trim();
                if (message.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(message.slice(6)) as T;
                        yield data;
                    } catch (parseError) {
                        console.error('Failed to parse SSE message:', message, parseError);
                    }
                }
            }

            buffer = messages[messages.length - 1];
        }

        if (buffer.trim()) {
            const message = buffer.trim();
            if (message.startsWith('data: ')) {
                try {
                    const data = JSON.parse(message.slice(6)) as T;
                    yield data;
                } catch (parseError) {
                    console.error('Failed to parse final SSE message:', message, parseError);
                }
            }
        }
    } catch (error) {
        console.error("Streaming API Client Error:", error);
        throw error;
    }
}