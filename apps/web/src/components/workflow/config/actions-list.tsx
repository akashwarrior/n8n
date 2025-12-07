"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProviderType } from "@n8n/actions/types";
import { PROVIDERS } from "@n8n/actions";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, Search } from "lucide-react";
import { ActionIcon } from "@/components/ui/action-icon";

type ActionGridItemProps = {
  lable: string;
  description: string;
  disabled?: boolean;
  type: ProviderType;
  onclick: () => void;
};

function ActionGridItem({
  type,
  lable,
  description,
  disabled,
  onclick,
}: ActionGridItemProps) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "flex gap-4 py-10 items-center border-l-2 border-l-transparent hover:border-l-ring",
        disabled && "opacity-50 cursor-not-allowed",
      )}
      disabled={disabled}
      onClick={onclick}
    >
      <ActionIcon type={type} className="size-6" />
      <div className="flex flex-col items-start gap-1 flex-1 overflow-hidden text-left">
        <p className="font-medium text-sm">{lable}</p>
        <p className="text-xs text-muted-foreground whitespace-pre-wrap">
          {description}
        </p>
      </div>
      <ArrowRightIcon className="size-4" />
    </Button>
  );
}

type ActionGridProps = {
  disabled?: boolean;
  onUpdateConfig: (key: string, value: string) => void;
};

export function ActionsList({ disabled, onUpdateConfig }: ActionGridProps) {
  const [filter, setFilter] = useState("");

  const filteredProviders = PROVIDERS.filter((action) => {
    const searchTerm = filter.toLowerCase();
    return (
      action.label.toLowerCase().includes(searchTerm) ||
      action.description.toLowerCase().includes(searchTerm) ||
      action.type.toLowerCase().includes(searchTerm)
    );
  });

  const handleUpdateConfig = (actionType: ProviderType, actionId: string) => {
    onUpdateConfig("provider", actionType);
    onUpdateConfig("actionId", actionId);
  };

  return (
    <div className="flex flex-col gap-4 p-2 overflow-hidden flex-1">
      <div className="space-y-3 p-2">
        <Label className="ml-1 text-base" htmlFor="action-filter">
          Search Actions
        </Label>
        <div className="relative">
          <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
          <Input
            className="pl-8"
            disabled={disabled}
            id="action-filter"
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search actions..."
            value={filter}
          />
        </div>
      </div>

      <div className="flex flex-col overflow-y-auto">
        {filteredProviders.map((provider) => (
          <ActionGridItem
            key={provider.type}
            lable={provider.label}
            description={provider.description}
            disabled={disabled}
            type={provider.type}
            onclick={() =>
              handleUpdateConfig(provider.type, provider.actions[0].id)
            }
          />
        ))}
      </div>

      {filteredProviders.length === 0 && (
        <p className="py-8 text-center text-muted-foreground text-sm">
          No actions found
        </p>
      )}
    </div>
  );
}
