"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { api, Credentials } from "@/lib/api-client";
import { ProviderType } from "@n8n/actions/types";
import { projectIdAtom } from "@/store/workflow-store";
import { useAtomValue } from "jotai";
import { CredentialsFormDialog } from "../credentials-form-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CredentialsSelectorProps = {
  credentialType: ProviderType;
  value: string;
  onChange: (credentialId: string) => void;
  onOpenSettings: () => void;
  label?: string;
  disabled?: boolean;
};

export function CredentialsSelector({
  credentialType,
  value,
  onChange,
  onOpenSettings,
  label,
  disabled,
}: CredentialsSelectorProps) {
  const projectId = useAtomValue(projectIdAtom);
  const [credentials, setCredentials] = useState<Credentials[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const credentials = await api.credential.getAll({
        projectId,
        type: credentialType,
      });
      setCredentials(credentials);

      if (credentials.length === 1 && !value) {
        onChange(credentials[0].id);
      }
    } catch (error) {
      console.error("Failed to load credentials:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCredentials();
  }, [credentialType]);

  const handleValueChange = (newValue: string) => {
    if (newValue === "new_credentials") {
      setShowNewDialog(true);
    } else if (newValue === "manage_credentials") {
      onOpenSettings();
    } else {
      onChange(newValue);
    }
  };

  const handleNewCredentialCreated = async (credentialId: string) => {
    await loadCredentials();
    onChange(credentialId);
    setShowNewDialog(false);
  };

  if (loading) {
    return (
      <Select disabled value="">
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Loading..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {!credentials.length && label && (
        <span className="text-muted-foreground text-sm">{label}</span>
      )}
      <Select
        disabled={disabled}
        onValueChange={handleValueChange}
        value={value}
      >
        <SelectTrigger className="flex-1">
          {credentials.length ? (
            <SelectValue placeholder="Select credential..." />
          ) : (
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-orange-500/50 p-0.5">
                <AlertTriangle className="size-3 text-white" />
              </div>
              <SelectValue placeholder="No credentials" />
            </div>
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="new_credentials">New Credentials</SelectItem>
          <SelectItem value="manage_credentials">Manage Credentials</SelectItem>
          {credentials.length ? <Separator className="my-1" /> : null}
          {credentials.map((credential) => (
            <SelectItem key={credential.id} value={credential.id}>
              {credential.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <CredentialsFormDialog
        mode="create"
        onClose={() => setShowNewDialog(false)}
        onSuccess={handleNewCredentialCreated}
        open={showNewDialog}
        credentials={{ type: credentialType }}
      />
    </div>
  );
}
