import { GitBranchIcon, SettingsIcon, ZapIcon } from "lucide-react";
import type { Provider } from "../types";
import { createElement } from "react";
import { httpRequest, httpRequestConfig } from "./actions/http-request";
import { condition, conditionConfig } from "./actions/condition";

export const system: Provider = {
  type: "system",
  label: "System",
  description: "System actions",
  requireCredential: false,
  icon: {
    "http-request": ({ className }) =>
      createElement(ZapIcon, { className: className + " text-yellow-400" }),
    condition: ({ className }) =>
      createElement(GitBranchIcon, { className: className + " text-pink-400" }),
    default: SettingsIcon,
  },

  formFields: [],
  credentialMapping: () => ({}),

  actions: [
    {
      id: "http-request",
      label: "HTTP Request",
      description: "Make an HTTP request",
      actionFunction: httpRequest,
      config: httpRequestConfig,
    },
    {
      id: "condition",
      label: "Condition",
      description: "Check a condition",
      actionFunction: condition,
      config: conditionConfig,
    },
  ],
};
