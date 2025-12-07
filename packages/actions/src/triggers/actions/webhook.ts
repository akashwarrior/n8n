import type { ActionConfigField } from "../../types";

export const webhookConfig: ActionConfigField[] = [
    {
        name: "httpMethod",
        label: "HTTP Method",
        type: "select",
        required: true,
        default: "POST",
        options: [
            { label: "GET", value: "GET" },
            { label: "POST", value: "POST" },
        ],
    },
    {
        name: "webhookUrl",
        label: "Webhook URL",
        type: "display",
    },
    {
        name: "httpHeaders",
        label: "Request Headers (Optional)",
        type: "json",
        default: "{}",
    },
    {
        name: "webhookResponse",
        label: "Response Body (Optional)",
        type: "json",
        default: "{}",
        description:
            "Enter a sample JSON payload to test the webhook trigger.",
    },
] as const;