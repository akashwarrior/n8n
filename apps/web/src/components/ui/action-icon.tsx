"use client";

import { HelpCircle } from "lucide-react";
import { ProviderType } from "@n8n/actions/types";
import { PROVIDERS } from "@n8n/actions";

interface ActionIconProps {
  type: ProviderType;
  className?: string;
  actionId?: string;
}

export function ActionIcon({
  type,
  className = "size-12",
  actionId = "",
}: ActionIconProps) {
  const provider = PROVIDERS.find((provider) => provider.type === type);

  if (provider) {
    if (typeof provider.icon === "object" && "default" in provider.icon) {
      let Icon = provider.icon[actionId] || provider.icon["default"];
      return <Icon className={className} />;
    } else {
      return <provider.icon className={className} />;
    }
  }

  return <HelpCircle className={className} />;
}
