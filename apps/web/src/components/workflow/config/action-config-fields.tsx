"use client";

import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CodeEditor } from "@/components/ui/code-editor";
import { Switch } from "@/components/ui/switch";
import { TimezoneSelect } from "@/components/ui/timezone-select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PROVIDERS } from "@n8n/actions";
import { CopyIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActionConfigField } from "@n8n/actions/types";

type ConfigListProps = {
  config: Record<string, unknown>;
  actionType?: string;
  actionId?: string;
  disabled: boolean;
  onUpdateConfig: (key: string, value: any) => void;
};

const InputField = ({
  field,
  value,
  onChange,
  disabled,
}: {
  field: ActionConfigField;
  value: any;
  onChange: (value: any) => void;
  disabled: boolean;
}) => {
  switch (field.type) {
    case "text":
      return (
        <Input
          id={field.name}
          disabled={disabled}
          placeholder={field.placeholder}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "number":
      return (
        <Input
          id={field.name}
          type="number"
          disabled={disabled}
          placeholder={field.placeholder}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "textarea":
      return (
        <Textarea
          id={field.name}
          disabled={disabled}
          placeholder={field.placeholder}
          rows={5}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "select":
      return (
        <Select
          disabled={disabled}
          onValueChange={onChange}
          value={(value as string) || field.default || ""}
        >
          <SelectTrigger className="w-full" id={field.name}>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "checkbox":
      return (
        <div className="flex items-center space-x-2">
          <Switch
            id={field.name}
            disabled={disabled}
            checked={(value as boolean) || false}
            onCheckedChange={onChange}
          />
          <Label htmlFor={field.name}>{field.label}</Label>
        </div>
      );
    case "json":
      return (
        <div className="overflow-hidden rounded-md border">
          <CodeEditor
            defaultLanguage="json"
            onChange={(v) => onChange(v || "{}")}
            options={{ readOnly: disabled }}
            value={(value as string) || field.default || "{}"}
          />
        </div>
      );
    case "code":
      return (
        <div className="overflow-hidden rounded-md border">
          <CodeEditor
            defaultLanguage="javascript"
            onChange={(v) => onChange(v || "")}
            options={{ readOnly: disabled }}
            value={(value as string) || field.default || ""}
          />
        </div>
      );
    case "timezone":
      return (
        <TimezoneSelect
          disabled={disabled}
          id={field.name}
          onValueChange={onChange}
          value={(value as string) || field.default || "UTC"}
        />
      );
    case "display":
      return (
        <div className="flex gap-2">
          <Input
            className="font-mono text-xs"
            disabled
            value={(value as string) || ""}
          />
          <Button
            disabled={!value}
            onClick={() => {
              if (value) {
                navigator.clipboard.writeText(value);
                toast.success(`${field.label} copied to clipboard`);
              }
            }}
            size="icon"
            variant="outline"
          >
            <CopyIcon className="h-4 w-4" />
          </Button>
        </div>
      );

    default:
      return null;
  }
};

export function ActionConfigFields({
  config,
  actionType,
  actionId,
  disabled,
  onUpdateConfig,
}: ConfigListProps) {
  const actionDefinition = useMemo(() => {
    if (!actionType || !actionId) return null;
    const provider = PROVIDERS.find((p) => p.type === actionType);
    return provider?.actions.find((a) => a.id === actionId);
  }, [actionType, actionId]);

  if (!actionDefinition) {
    if (actionId) {
      return (
        <div className="p-4 text-sm text-yellow-600 bg-yellow-50 rounded">
          Action definition not found for {actionType}:{actionId}
        </div>
      );
    }
    return null;
  }

  return (
    <>
      {actionDefinition.config.map((field) => (
        <div key={field.name} className="space-y-2">
          {field.type !== "checkbox" && (
            <Label htmlFor={field.name} className="ml-1">
              {field.label} {field.required && "*"}
            </Label>
          )}

          <InputField
            field={field}
            value={config[field.name]}
            onChange={(val) => onUpdateConfig(field.name, val)}
            disabled={disabled}
          />

          {field.description && (
            <p className="text-muted-foreground text-xs">{field.description}</p>
          )}
        </div>
      ))}
    </>
  );
}
