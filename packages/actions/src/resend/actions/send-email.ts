import { Resend } from "resend";
import type { ActionConfigField } from "../../types";

type SendEmailResult =
  | { success: true; id: string }
  | { success: false; error: string };

export type SendEmailInput = {
  credentialId?: string;
  emailTo: string;
  emailSubject: string;
  emailBody: string;
};

export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const credentials = {} as Record<string, string>;

  const apiKey = credentials.RESEND_API_KEY;
  const fromEmail = credentials.RESEND_FROM_EMAIL;

  if (!apiKey) {
    return {
      success: false,
      error:
        "RESEND_API_KEY is not configured. Please add it in Project Credentials.",
    };
  }

  if (!fromEmail) {
    return {
      success: false,
      error:
        "RESEND_FROM_EMAIL is not configured. Please add it in Project Credentials.",
    };
  }

  try {
    const resend = new Resend(apiKey);

    const result = await resend.emails.send({
      from: fromEmail,
      to: input.emailTo,
      subject: input.emailSubject,
      text: input.emailBody,
    });

    if (result.error) {
      return {
        success: false,
        error: result.error.message || "Failed to send email",
      };
    }

    return { success: true, id: result.data.id };
  } catch (error) {
    return {
      success: false,
      error: `Failed to send email`,
    };
  }
}


export const sendEmailConfig: ActionConfigField[] = [
  {
    name: "emailTo",
    label: "To (Email Address)",
    type: "text",
    required: true,
    placeholder: "user@example.com or {{NodeName.email}}",
  },
  {
    name: "emailSubject",
    label: "Subject",
    type: "text",
    required: true,
    placeholder: "Subject or {{NodeName.title}}",
  },
  {
    name: "emailBody",
    label: "Body",
    type: "textarea",
    required: true,
    placeholder: "Email content or {{NodeName.description}}",
  },
] as const;