import { MailIcon } from "lucide-react";
import type { Provider } from "../types";
import { sendEmail, sendEmailConfig } from "./actions/send-email";

export const resend: Provider = {
  type: "resend",
  label: "Resend",
  description: "Send transactional emails",
  requireCredential: true,
  icon: MailIcon,

  formFields: [
    {
      id: "apiKey",
      label: "API Key",
      type: "text",
      placeholder: "re_...",
      configKey: "apiKey",
      helpText: "Get your API key from ",
      helpLink: {
        text: "resend.com/api-keys",
        url: "https://resend.com/api-keys",
      },
    },
    {
      id: "fromEmail",
      label: "Default Sender",
      type: "email",
      placeholder: "Your Name <noreply@yourdomain.com>",
      configKey: "fromEmail",
      helpText: "The email address that will appear as the sender",
    },
  ],

  credentialMapping: (config) => {
    const creds: Record<string, string> = {};
    if (config.apiKey) {
      creds.RESEND_API_KEY = String(config.apiKey);
    }
    if (config.fromEmail) {
      creds.RESEND_FROM_EMAIL = String(config.fromEmail);
    }
    return creds;
  },

  actions: [
    {
      id: "send-email",
      label: "Send Email",
      description: "Send an email via Resend",
      actionFunction: sendEmail,
      config: sendEmailConfig,
    },
  ],
};
