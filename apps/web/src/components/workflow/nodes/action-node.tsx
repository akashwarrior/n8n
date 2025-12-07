"use client";

import type { NodeProps } from "@xyflow/react";
import { memo } from "react";
import { PROVIDERS } from "@n8n/actions";
import { ActionIcon } from "@/components/ui/action-icon";
import { ProviderType } from "@n8n/actions/types";
import { cn } from "@/lib/utils";
import { type WorkflowNodeData } from "@/store/workflow-store";
import {
  Node,
  NodeDescription,
  NodeTitle,
} from "@/components/ai-elements/node";
import { Check, EyeOff, PlusIcon, XCircle } from "lucide-react";

const StatusBadge = ({
  status,
}: {
  status?: "idle" | "running" | "success" | "error";
}) => {
  if (!status || status === "idle" || status === "running") {
    return null;
  }

  let StatusIcon = Check;

  if (status === "error") {
    StatusIcon = XCircle;
  }

  return (
    <div
      className={cn(
        "absolute top-2 right-2 rounded-full p-1",
        status === "success" && "bg-green-500/50",
        status === "error" && "bg-red-500/50",
      )}
    >
      <StatusIcon className="size-3.5 text-white" strokeWidth={2.5} />
    </div>
  );
};

type ActionNodeProps = NodeProps & {
  data?: WorkflowNodeData;
  id: string;
};

export const ActionNode = memo(({ data, selected }: ActionNodeProps) => {
  if (!data) {
    return null;
  }

  const actionId = (data.config?.actionId as string) || "";
  const isDisabled = data.enabled === false;
  const status = data.status;

  if (!actionId) {
    return (
      <Node
        className={cn(
          "flex h-48 w-48 flex-col items-center justify-center shadow-none transition-all duration-150 ease-out",
          selected && "border-primary",
          isDisabled && "opacity-50",
        )}
        handles={{ target: true, source: true }}
        status={status}
      >
        {isDisabled && (
          <div className="absolute top-2 left-2 rounded-full bg-gray-500/50 p-1">
            <EyeOff className="size-3.5 text-white" />
          </div>
        )}
        <div className="flex flex-col items-center justify-center gap-3 p-6">
          <PlusIcon className="size-12 text-muted-foreground" />
          <div className="flex flex-col items-center gap-1 text-center">
            <NodeTitle className="text-base">
              {data.label || "Action"}
            </NodeTitle>
            <NodeDescription className="text-xs">
              Select an action
            </NodeDescription>
          </div>
        </div>
      </Node>
    );
  }

  const provider = PROVIDERS.find(
    (provider) => provider.type === data.provider,
  );
  const action = provider?.actions.find((action) => action.id === actionId);

  const displayDescription = data.description || action?.description;

  return (
    <Node
      className={cn(
        "relative flex h-48 w-48 flex-col items-center justify-center shadow-none transition-all duration-150 ease-out",
        selected && "border-primary",
        isDisabled && "opacity-50",
      )}
      handles={{ target: true, source: true }}
      status={status}
    >
      {isDisabled && (
        <div className="absolute top-2 left-2 rounded-full bg-gray-500/50 p-1">
          <EyeOff className="size-3.5 text-white" />
        </div>
      )}

      <StatusBadge status={status} />

      <div className="flex flex-col items-center justify-center gap-3 p-6">
        <ActionIcon type={data.provider as ProviderType} actionId={actionId} />

        <div className="flex flex-col items-center gap-1 text-center">
          <NodeTitle className="text-base">
            {data.label || action?.label}
          </NodeTitle>

          {displayDescription && (
            <NodeDescription className="text-xs">
              {displayDescription}
            </NodeDescription>
          )}
        </div>
      </div>
    </Node>
  );
});

ActionNode.displayName = "ActionNode";
