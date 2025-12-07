"use client";

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRef, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "../ui/input";

import { api } from "@/lib/api-client";
import { CredentialsDialog } from "../settings/credentials-dialog";
import { ActionConfig } from "./config/action-config";
import { ActionsList } from "./config/actions-list";

import { PROVIDERS } from "@n8n/actions";
import { ProviderType } from "@n8n/actions/types";
import { CredentialsSelector } from "../ui/credential-selector";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { MultiSelectionPanel } from "./config/multi-selection-panel";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  projectIdAtom,
  deleteNodeAtom,
  deleteSelectedItemsAtom,
  isGeneratingAtom,
  nodesAtom,
  showWorkflowPanelAtom,
  updateNodeAtom,
  workflowIdAtom,
  selectedNodeIdAtom,
} from "@/store/workflow-store";

const SidebarContent = ({ selectedNodeId }: { selectedNodeId: string }) => {
  const nodes = useAtomValue(nodesAtom);
  const workflowId = useAtomValue(workflowIdAtom);
  const projectId = useAtomValue(projectIdAtom);
  const isGenerating = useAtomValue(isGeneratingAtom);
  const updateNode = useSetAtom(updateNodeAtom);
  const deleteNode = useSetAtom(deleteNodeAtom);
  const deleteSelectedItems = useSetAtom(deleteSelectedItemsAtom);
  const [showDeleteNodeAlert, setShowDeleteNodeAlert] = useState(false);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);
  const selectedNodes = nodes.filter((node) => node.selected);

  const handleDelete = () => {
    deleteNode(selectedNodeId);
    setShowDeleteNodeAlert(false);
  };

  const handleToggleEnabled = () => {
    if (selectedNode) {
      const currentEnabled = selectedNode.data.enabled ?? true;
      updateNode({
        id: selectedNode.id,
        data: { enabled: !currentEnabled },
      });
    }
  };

  const handleUpdateNodeData = (key: string, value: string) => {
    if (selectedNode) {
      updateNode({ id: selectedNode.id, data: { [key]: value } });
    }
  };

  const autoSelectCredential = async (
    nodeId: string,
    providerType: ProviderType,
    config: Record<string, unknown>,
  ) => {
    const provider = PROVIDERS.find(
      (provider) => provider.type === providerType,
    )!;

    try {
      if (!provider.requireCredential) {
        return; // this will trigger finally block and exit the function
      }
      const credentials = await api.credential.getAll({
        projectId,
        type: providerType,
      });
      if (credentials.length === 1) {
        const newConfig = {
          ...config,
          credentialId: credentials[0].id,
        };
        updateNode({ id: nodeId, data: { config: newConfig } });
      }
    } catch (error) {
      console.error("Failed to auto-select credential:", error);
    }
  };

  const handleUpdateConfig = (key: string, value: string) => {
    if (!selectedNode) return;

    if (key !== "provider") {
      updateNode({
        id: selectedNode.id,
        data: { config: { ...selectedNode.data.config, [key]: value } },
      });
      return;
    }

    let newConfig = { ...selectedNode.data.config };
    if (newConfig?.credentialId) {
      newConfig.credentialId = undefined;
    }

    const providerType = value as ProviderType;

    updateNode({
      id: selectedNode.id,
      data: {
        provider: providerType,
        config: newConfig,
      },
    });

    autoSelectCredential(selectedNode.id, providerType, newConfig);
  };

  if (!selectedNode) {
    return null;
  }

  if (selectedNodes.length > 1) {
    return (
      <MultiSelectionPanel
        selectedNodes={selectedNodes}
        onDelete={deleteSelectedItems}
      />
    );
  }

  return (
    <>
      {!selectedNode.data.provider ? (
        <ActionsList
          disabled={isGenerating}
          onUpdateConfig={handleUpdateConfig}
        />
      ) : (
        <div className="flex-1 space-y-5 overflow-y-auto p-4 pt-5">
          <ActionConfig
            disabled={isGenerating}
            actionType={selectedNode.data.provider}
            config={{
              ...selectedNode.data.config,
              ...(selectedNode.data.provider === "triggers" &&
                selectedNode.data.config?.actionId === "Webhook" && {
                  webhookUrl: `${
                    typeof window !== "undefined" ? window.location.origin : ""
                  }/api/workflows/${workflowId}/webhook`,
                }),
            }}
            onUpdateConfig={handleUpdateConfig}
          />

          <div className="space-y-3">
            <Label className="ml-1" htmlFor="label">
              Label
            </Label>
            <Input
              disabled={isGenerating}
              id="label"
              onChange={(e) => handleUpdateNodeData("label", e.target.value)}
              placeholder="Action Name"
              value={selectedNode.data.label || ""}
            />
          </div>

          <div className="space-y-3">
            <Label className="ml-1" htmlFor="description">
              Description
            </Label>
            <Input
              disabled={isGenerating}
              id="description"
              onChange={(e) =>
                handleUpdateNodeData("description", e.target.value)
              }
              placeholder="Optional description"
              value={selectedNode.data.description || ""}
            />
          </div>
        </div>
      )}

      <div className="flex shrink-0 items-center justify-between border-t p-4">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleToggleEnabled}
            title={
              selectedNode.data.enabled === false
                ? "Enable Action"
                : "Disable Action"
            }
          >
            {selectedNode.data.enabled === false ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowDeleteNodeAlert(true)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        {selectedNode.data.provider &&
          PROVIDERS.find((p) => p.type === selectedNode.data.provider)
            ?.requireCredential && (
            <CredentialsSelector
              credentialType={selectedNode.data.provider}
              label="Credential"
              onChange={(id) => handleUpdateConfig("credentialId", id)}
              onOpenSettings={() => setShowCredentialsDialog(true)}
              value={(selectedNode.data.config?.credentialId as string) || ""}
            />
          )}
      </div>

      <AlertDialog
        onOpenChange={setShowDeleteNodeAlert}
        open={showDeleteNodeAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Node</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this node? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CredentialsDialog
        onOpenChange={setShowCredentialsDialog}
        open={showCredentialsDialog}
      />
    </>
  );
};

type NodeConfigPanelProps = {
  defaultPanelWidth: number;
};

export const WorkflowSidebarPanel = ({
  defaultPanelWidth,
}: NodeConfigPanelProps) => {
  const [showWorkflowPanel, setShowWorkflowPanel] = useAtom(
    showWorkflowPanelAtom,
  );
  const selectedNodeId = useAtomValue(selectedNodeIdAtom);
  const [panelWidth, setPanelWidth] = useState(defaultPanelWidth);
  const isResizing = useRef(false);
  const isMobile = useIsMobile();

  const isWorkflowPanelOpen = showWorkflowPanel && !!selectedNodeId;

  const handleSetPanelWidth = (width: number) => {
    setPanelWidth(width);
    document.cookie = `sidebar-width=${width}; path=/; max-age=31536000`;
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing.current) {
        return;
      }
      const newWidth =
        ((window.innerWidth - moveEvent.clientX) / window.innerWidth) * 100;
      handleSetPanelWidth(Math.min(50, Math.max(20, newWidth)));
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return isMobile ? (
    <Sheet onOpenChange={setShowWorkflowPanel} open={isWorkflowPanelOpen}>
      <SheetContent className="w-full p-0 sm:max-w-full" side="bottom">
        <SheetHeader className="sr-only">
          <SheetTitle />
        </SheetHeader>

        <div className="h-[80vh] flex flex-col">
          {selectedNodeId && <SidebarContent selectedNodeId={selectedNodeId} />}
        </div>
      </SheetContent>
    </Sheet>
  ) : (
    <div
      className={cn(
        "absolute inset-y-0 right-0 z-20 border-l bg-background transition-transform duration-300 ease-out",
        isWorkflowPanelOpen ? "translate-x-0" : "translate-x-full",
      )}
      style={{ width: `${panelWidth}vw` }}
    >
      <div
        className={cn(
          "absolute peer inset-y-0 bg-transparent px-2 -left-2",
          isWorkflowPanelOpen
            ? "group cursor-col-resize"
            : "pointer-events-none",
        )}
        onMouseDown={handleResizeStart}
      >
        <div className="w-1 h-full transition-colors group-hover:bg-blue-500 group-active:bg-blue-600" />
      </div>

      <div className="size-full flex flex-col bg-background">
        {selectedNodeId && <SidebarContent selectedNodeId={selectedNodeId} />}
      </div>
    </div>
  );
};
