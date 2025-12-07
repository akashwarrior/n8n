import type { ActionConfigField } from "../../types";

type HttpRequestResult =
    | { success: true; body: string; status: number }
    | { success: false; body: string; status: number };

export type HttpRequestInput = {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string;
};

export async function httpRequest(
    input: HttpRequestInput,
): Promise<HttpRequestResult> {
    const url = input.url;

    if (!url) {
        return {
            success: false,
            body: "URL is not configured. Please add it in Project Credentials.",
            status: 500,
        };
    }

    try {
        const response = await fetch(url, {
            method: input.method,
            body: input.body,
            headers: input.headers,
        });

        const body = await response.text();
        const status = response.status;

        return { success: response.ok, body, status };
    } catch (error) {
        return {
            success: false,
            body: `Failed to make HTTP request: ${error instanceof Error ? error.message : "Unknown error"}`,
            status: 500,
        };
    }
}

export const httpRequestConfig: ActionConfigField[] = [
    {
        name: "httpMethod",
        label: "HTTP Method",
        type: "select",
        required: true,
        default: "POST",
        options: [
            { label: "GET", value: "GET" },
            { label: "POST", value: "POST" },
            { label: "PUT", value: "PUT" },
            { label: "PATCH", value: "PATCH" },
            { label: "DELETE", value: "DELETE" },
        ],
    },
    {
        name: "endpoint",
        label: "URL",
        type: "text",
        required: true,
        placeholder: "https://api.example.com/endpoint or {{NodeName.url}}",
    },
    {
        name: "httpHeaders",
        label: "Headers (JSON)",
        type: "json",
        default: "{}",
    },
    {
        name: "httpBody",
        label: "Body (JSON)",
        type: "json",
        default: "{}",
        description: "Body is disabled for GET requests", // Note: The UI logic for disabling might need to be handled carefully if generic
    },
] as const;