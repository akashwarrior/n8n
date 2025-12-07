"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { api, type Credentials } from "@/lib/api-client";
import type { ProviderType } from "@n8n/actions/types";
import { PROVIDERS } from "@n8n/actions";
import { useAtomValue } from "jotai";
import { projectIdAtom } from "@/store/workflow-store";
import { unstable_serialize } from "swr/infinite";
import { mutate } from "swr";
import { defaultParams, keyBuilder } from "@/lib/pagination";
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
import { AtomIcon } from "lucide-react";

type CredentialsFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: (credentialsId: string) => void;
  mode: "create" | "edit";
  credentials?: Credentials | Pick<Credentials, "type"> | null;
};

type CredentialsFormData = {
  name: string;
  type: ProviderType;
  config: Record<string, string>;
};

export function CredentialsFormDialog({
  open,
  onClose,
  onSuccess,
  credentials,
  mode,
}: CredentialsFormDialogProps) {
  const projectId = useAtomValue(projectIdAtom);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CredentialsFormData>({
    name: "",
    type: "resend",
    config: {},
    ...credentials,
  });
  const provider = PROVIDERS.find(
    (provider) => provider.type === formData.type,
  );

  const handleSave = async () => {
    setSaving(true);
    const credentialsName =
      formData.name.trim() || `${provider?.label} Credentials`;

    let promise = null;
    let toastMessage = "Credentials updated";
    let toastError = "Failed to update credentials";

    if (mode === "edit" && credentials && "id" in credentials) {
      promise = api.credential.update({
        id: credentials.id,
        name: credentialsName,
        config: formData.config,
      });
    } else {
      promise = api.credential.create({
        name: credentialsName,
        type: formData.type,
        config: formData.config,
        projectId: projectId,
      });
      toastMessage = "Credentials created";
      toastError = "Failed to create credentials";
    }

    toast.promise(promise, {
      loading: "Saving credentials...",
      success: ({ id }) => {
        mutate(
          unstable_serialize((index) =>
            keyBuilder(index, "/api/credentials", defaultParams, { projectId }),
          ),
        );
        onSuccess?.(id);
        onClose();
        return toastMessage;
      },
      error: toastError,
      finally: () => setSaving(false),
    });
  };

  const updateConfig = (key: string, value: string) => {
    setFormData({
      ...formData,
      config: { ...formData.config, [key]: value },
    });
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
                    type: value as ProviderType,
                    config: {},
                  })
                }
                value={formData.type}
              >
                <SelectTrigger className="w-full" id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((action) => (
                    <SelectItem key={action.type} value={action.type}>
                      <div className="flex items-center gap-2">
                        <AtomIcon className="size-4" />
                        {action.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {provider?.formFields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              <Input
                id={field.id}
                type={field.type}
                placeholder={field.placeholder}
                onChange={(e) => updateConfig(field.configKey, e.target.value)}
                value={formData.config[field.configKey] || ""}
              />
              {field.helpText && (
                <p className="text-muted-foreground text-xs">
                  {field.helpText}
                  {field.helpLink && (
                    <a
                      href={field.helpLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-primary"
                    >
                      {field.helpLink.text}
                    </a>
                  )}
                </p>
              )}
            </div>
          ))}

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
              placeholder={`${provider?.label} Credentials`}
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
