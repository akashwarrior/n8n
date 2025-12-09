export type ProviderType = "resend" | "system" | "triggers";

export type ActionConfigField = {
  name: string;
  label: string;
  type:
  | "text"
  | "textarea"
  | "select"
  | "code"
  | "json"
  | "number"
  | "checkbox"
  | "timezone"
  | "display";
  required?: boolean;
  placeholder?: string;
  description?: string;
  options?: { label: string; value: string }[];
  default?: any;
};

export type Provider = {
  type: ProviderType;
  label: string;
  description: string;
  requireCredential: boolean;
  icon:
  | React.ComponentType<{ className?: string }>
  | (Record<string, React.ComponentType<{ className?: string }>> & {
    default: React.ComponentType<{ className?: string }>;
  });

  formFields: Array<{
    id: string;
    label: string;
    type: React.HTMLInputTypeAttribute;
    placeholder?: string;
    helpText?: string;
    helpLink?: { text: string; url: string };
    configKey: string;
  }>;

  credentialMapping: (
    config: Record<string, unknown>,
  ) => Record<string, string>;
  actions: Array<{
    id: string;
    label: string;
    description: string;
    actionFunction: Function;
    config: ActionConfigField[];
  }>;
};
