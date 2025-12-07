import type { ActionConfigField } from "../../types";

export const scheduleConfig: ActionConfigField[] = [
    {
        name: "scheduleHours",
        label: "Hours (0-23)",
        type: "number",
        placeholder: "0",
        required: true,
        default: "0",
    },
    {
        name: "scheduleMinutes",
        label: "Minutes (0-59)",
        type: "number",
        placeholder: "0",
        required: true,
        default: "0",
    },
    {
        name: "scheduleSeconds",
        label: "Seconds (0-59)",
        type: "number",
        placeholder: "0",
        required: true,
        default: "0",
    },
    {
        name: "scheduleTimezone",
        label: "Timezone",
        type: "timezone",
        required: true,
        default: "UTC",
    },
] as const; 