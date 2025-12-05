"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { IntegrationIcon } from "@/components/ui/integration-icon";
import { api, type Credentials } from "@/lib/api-client";
import type { IntegrationType } from "@n8n/Integrations/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

type CredentialsFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: (credentialsId: string) => void;
  credentials?: Credentials | null;
  mode: "create" | "edit";
  projectId: string;
};

type CredentialsFormData = {
  name: string;
  type: IntegrationType;
  config: Record<string, string>;
};

const CREDENTIALS_LABELS: Record<IntegrationType, string> = {
  gemini: "Gemini",
  slack: "Slack",
  database: "Database",
  resend: "Resend",
};

export function CredentialsFormDialog({
  open,
  onClose,
  onSuccess,
  credentials,
  mode,
  projectId,
}: CredentialsFormDialogProps) {
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [formData, setFormData] = useState<CredentialsFormData>({
    name: "",
    type: "resend",
    config: {},
    ...credentials,
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      const credentialsName =
        formData.name.trim() ||
        `${CREDENTIALS_LABELS[formData.type]} Credentials`;

      if (mode === "edit" && credentials) {
        await api.credential.update({
          id: credentials.id,
          name: credentialsName,
          config: formData.config,
        });
        toast.success("Credentials updated");
        onSuccess?.(credentials.id);
      } else {
        const newCredentials = await api.credential.create({
          name: credentialsName,
          type: formData.type,
          config: formData.config,
          projectId: projectId,
        });
        toast.success("Credentials created");
        onSuccess?.(newCredentials.id);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save credentials:", error);
      toast.error("Failed to save credentials");
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (key: string, value: string) => {
    setFormData({
      ...formData,
      config: { ...formData.config, [key]: value },
    });
  };

  const renderConfigFields = () => {
    switch (formData.type) {
      case "resend":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <InputGroup>
                <InputGroupInput
                  id="apiKey"
                  onChange={(e) => updateConfig("apiKey", e.target.value)}
                  placeholder="re_..."
                  type={showApiKey ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.config.apiKey || ""}
                />

                <InputGroupAddon
                  align="inline-end"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="cursor-pointer"
                >
                  {showApiKey ? <IconEyeOff /> : <IconEye />}
                </InputGroupAddon>
              </InputGroup>
              <p className="text-muted-foreground text-xs">
                Get your API key from{" "}
                <a
                  className="underline hover:text-foreground"
                  href="https://resend.com/api-keys"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  resend.com/api-keys
                </a>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromEmail">From Email</Label>
              <Input
                id="fromEmail"
                onChange={(e) => updateConfig("fromEmail", e.target.value)}
                type="email"
                placeholder="noreply@example.com"
                value={formData.config.fromEmail || ""}
              />
            </div>
          </>
        );
      case "slack":
        return (
          <div className="space-y-2">
            <Label htmlFor="apiKey">Bot Token</Label>
            <InputGroup>
              <InputGroupInput
                id="apiKey"
                onChange={(e) => updateConfig("apiKey", e.target.value)}
                placeholder="xoxb-..."
                type={showApiKey ? "text" : "password"}
                autoComplete="new-password"
                value={formData.config.apiKey || ""}
              />

              <InputGroupAddon
                align="inline-end"
                onClick={() => setShowApiKey(!showApiKey)}
                className="cursor-pointer"
              >
                {showApiKey ? <IconEyeOff /> : <IconEye />}
              </InputGroupAddon>
            </InputGroup>
            <p className="text-muted-foreground text-xs">
              Create a Slack app and get your bot token from{" "}
              <a
                className="underline hover:text-foreground"
                href="https://api.slack.com/apps"
                rel="noopener noreferrer"
                target="_blank"
              >
                api.slack.com/apps
              </a>
            </p>
          </div>
        );
      case "database":
        return (
          <div className="space-y-2">
            <Label htmlFor="url">Database URL</Label>
            <InputGroup>
              <InputGroupInput
                id="url"
                onChange={(e) => updateConfig("url", e.target.value)}
                placeholder="postgresql://..."
                type={showApiKey ? "text" : "password"}
                autoComplete="new-password"
                value={formData.config.url || ""}
              />

              <InputGroupAddon
                align="inline-end"
                onClick={() => setShowApiKey(!showApiKey)}
                className="cursor-pointer"
              >
                {showApiKey ? <IconEyeOff /> : <IconEye />}
              </InputGroupAddon>
            </InputGroup>
            <p className="text-muted-foreground text-xs">
              Connection string in the format:
              postgresql://user:password@host:port/database
            </p>
          </div>
        );
      case "gemini":
        return (
          <div className="space-y-2">
            <Label htmlFor="apiKey">Gemini API Key</Label>
            <InputGroup>
              <InputGroupInput
                id="apiKey"
                onChange={(e) => updateConfig("apiKey", e.target.value)}
                placeholder="API Key"
                type={showApiKey ? "text" : "password"}
                autoComplete="new-password"
                value={formData.config.apiKey || ""}
              />

              <InputGroupAddon
                align="inline-end"
                onClick={() => setShowApiKey(!showApiKey)}
                className="cursor-pointer"
              >
                {showApiKey ? <IconEyeOff /> : <IconEye />}
              </InputGroupAddon>
            </InputGroup>
            <p className="text-muted-foreground text-xs">
              Get your API key from{" "}
              <a
                className="underline hover:text-foreground"
                href="https://ai.google.dev"
                rel="noopener noreferrer"
                target="_blank"
              >
                ai.google.dev
              </a>
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog onOpenChange={(isOpen) => !isOpen && onClose()} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Credentials" : "Add Credentials"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update credentials configuration"
              : "Configure a new credentials"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {mode === "create" && (
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                disabled={!!credentials?.type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    type: value as IntegrationType,
                    config: {},
                  })
                }
                value={formData.type}
              >
                <SelectTrigger className="w-full" id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CREDENTIALS_LABELS).map(([type, label]) => (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <IntegrationIcon
                          className="size-4"
                          type={type as IntegrationType}
                        />
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {renderConfigFields()}

          <div className="space-y-2">
            <Label htmlFor="name">Name (Optional)</Label>
            <Input
              id="name"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
              placeholder={`${CREDENTIALS_LABELS[formData.type]} Credentials`}
              value={formData.name}
            />
          </div>
        </div>

        <DialogFooter>
          <Button disabled={saving} onClick={() => onClose()} variant="outline">
            Cancel
          </Button>
          <Button disabled={saving} onClick={handleSave}>
            {saving ? <Spinner className="mr-2 size-4" /> : null}
            {mode === "edit" ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
