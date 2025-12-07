"use client";

import { Label } from "@/components/ui/label";
import { PROVIDERS } from "@n8n/actions";
import { ActionConfigFields } from "./action-config-fields";
import { ActionIcon } from "@/components/ui/action-icon";
import { ProviderType } from "@n8n/actions/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ActionConfigProps = {
  actionType: ProviderType;
  config: Record<string, unknown>;
  onUpdateConfig: (key: string, value: string) => void;
  disabled: boolean;
};

export function ActionConfig({
  actionType,
  config,
  onUpdateConfig,
  disabled,
}: ActionConfigProps) {
  const provider = PROVIDERS.find((provider) => provider.type === actionType);

  const handleCategoryChange = (providerType: ProviderType) => {
    onUpdateConfig("provider", providerType);
    const provider = PROVIDERS.find(
      (provider) => provider.type === providerType,
    );
    const firstAction = provider?.actions[0];
    if (firstAction) {
      onUpdateConfig("actionId", firstAction.id);
    }
  };

  const handleActionTypeChange = (actionId: string) =>
    onUpdateConfig("actionId", actionId);

  if (!provider) {
    return "Provider not Found";
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-3">
          <Label className="ml-1" htmlFor="actionCategory">
            Category
          </Label>
          <Select
            disabled={disabled}
            onValueChange={handleCategoryChange}
            value={actionType}
          >
            <SelectTrigger className="w-full" id="actionCategory">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {PROVIDERS.map((provider) => (
                <SelectItem key={provider.type} value={provider.type}>
                  <div className="flex items-center gap-2">
                    <ActionIcon type={provider.type} className="size-4" />
                    <span>{provider.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="ml-1" htmlFor="actionType">
            Action
          </Label>
          <Select
            disabled={disabled}
            onValueChange={handleActionTypeChange}
            value={config?.actionId as string}
          >
            <SelectTrigger className="w-full" id="actionType">
              <SelectValue placeholder="Select action" />
            </SelectTrigger>
            <SelectContent>
              {provider.actions.map((action) => (
                <SelectItem key={action.id} value={action.id}>
                  {action.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ActionConfigFields
        config={config}
        actionType={actionType}
        actionId={config.actionId as string}
        disabled={disabled}
        onUpdateConfig={onUpdateConfig}
      />
    </>
  );
}
