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
  options?: { label: string; value: string }[]; // For select inputs
  default?: any;
};

export type Provider = {
  // Basic info
  type: ProviderType;
  label: string;
  description: string;
  requireCredential: boolean;
  icon:
    | React.ComponentType<{ className?: string }>
    | (Record<string, React.ComponentType<{ className?: string }>> & {
        default: React.ComponentType<{ className?: string }>;
      });

  // Form fields for the credentials dialog
  formFields: Array<{
    id: string;
    label: string;
    type: React.HTMLInputTypeAttribute;
    placeholder?: string;
    helpText?: string;
    helpLink?: { text: string; url: string };
    configKey: string; // Which key in CredentialConfig to store the value
  }>;

  // Credential mapping (how to map config to environment variables)
  credentialMapping: (
    config: Record<string, unknown>,
  ) => Record<string, string>;

  // Actions provided by this action
  actions: Array<{
    id: string;
    label: string;
    description: string;
    actionFunction: Function;
    config: ActionConfigField[];
  }>;
};
