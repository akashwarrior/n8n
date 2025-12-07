import { Clock, Play, Webhook } from "lucide-react";
import type { Provider } from "../types";
import { createElement } from "react";
import { scheduleConfig } from "./actions/schedule";
import { webhookConfig } from "./actions/webhook";

const none = () => { };

export const triggers: Provider = {
  type: "triggers",
  label: "Triggers",
  description: "Workflow triggers",
  requireCredential: false,
  icon: {
    Manual: ({ className }) =>
      createElement(Play, { className: className + " text-emerald-500" }),
    Schedule: ({ className }) =>
      createElement(Clock, { className: className + " text-orange-500" }),
    Webhook: ({ className }) =>
      createElement(Webhook, { className: className + " text-blue-500" }),
    default: Play,
  },

  formFields: [],
  credentialMapping: () => ({}),

  actions: [
    {
      id: "Manual",
      label: "Manual Trigger",
      description: "Trigger the workflow manually",
      actionFunction: none,
      config: [],
    },
    {
      id: "Schedule",
      label: "Schedule Trigger",
      description: "Trigger the workflow on a schedule",
      actionFunction: none,
      config: scheduleConfig,
    },
    {
      id: "Webhook",
      label: "Webhook Trigger",
      description: "Trigger the workflow via HTTP request",
      actionFunction: none,
      config: webhookConfig,
    },
  ],
};
