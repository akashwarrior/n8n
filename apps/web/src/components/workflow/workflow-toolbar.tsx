"use client";

import { useReactFlow } from "@xyflow/react";
import { useAtomValue, useSetAtom } from "jotai";
import { nanoid } from "nanoid";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

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
  Loader2,
  Play,
  Plus,
  Redo2,
  Settings2,
  Trash2,
  Undo2,
} from "lucide-react";

import {
  addNodeAtom,
  autosaveAtom,
  canRedoAtom,
  canUndoAtom,
  deleteNodeAtom,
  hasUnsavedChangesAtom,
  isGeneratingAtom,
  nodesAtom,
  redoAtom,
  selectedNodeIdAtom,
  showWorkflowPanelAtom,
  undoAtom,
  type WorkflowNode,
} from "@/store/workflow-store";

export function WorkflowToolbar() {
  const autosave = useSetAtom(autosaveAtom);
  const hasUnsavedChanges = useAtomValue(hasUnsavedChangesAtom);
  const nodes = useAtomValue(nodesAtom);
  const setShowWorkflowPanel = useSetAtom(showWorkflowPanelAtom);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const selectedNodeId = useAtomValue(selectedNodeIdAtom);
  const isGenerating = useAtomValue(isGeneratingAtom);
  const canUndo = useAtomValue(canUndoAtom);
  const canRedo = useAtomValue(canRedoAtom);
  const undo = useSetAtom(undoAtom);
  const redo = useSetAtom(redoAtom);
  const addNode = useSetAtom(addNodeAtom);
  const deleteNode = useSetAtom(deleteNodeAtom);
  const { screenToFlowPosition } = useReactFlow();

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  const handleDelete = () => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId);
    }
    setShowDeleteAlert(false);
  };

  const executeWorkflow = async () => {
    if (isExecuting) {
      return;
    }

    if (hasUnsavedChanges) {
      await autosave({ immediate: true });
    }
    setIsExecuting(true);
    toast.info("Not implemented :)");
    setTimeout(() => {
      setIsExecuting(false);
    }, 3000);
  };

  const handleAddStep = () => {
    // Get the ReactFlow wrapper (the visible canvas container)
    const flowWrapper = document.querySelector(".react-flow");
    if (!flowWrapper) {
      return;
    }

    const rect = flowWrapper.getBoundingClientRect();
    // Calculate center in absolute screen coordinates
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const position = screenToFlowPosition({ x: centerX, y: centerY });

    const nodeWidth = 192;
    const nodeHeight = 192;
    position.x -= nodeWidth / 2;
    position.y -= nodeHeight / 2;

    const offset = 20;
    const threshold = 20;

    let hasOverlap = true;
    let maxAttempts = 20;

    while (hasOverlap && maxAttempts--) {
      hasOverlap = nodes.some((node) => {
        const dx = Math.abs(node.position.x - position.x);
        const dy = Math.abs(node.position.y - position.y);
        return dx < threshold && dy < threshold;
      });

      if (hasOverlap) {
        position.x += offset;
        position.y += offset;
      }
    }

    const nodesLength = nodes.length > 0;

    const newNode: WorkflowNode = {
      id: nanoid(),
      type: "action",
      position: position,
      data: {
        provider: nodesLength ? undefined : "triggers",
        config: nodesLength ? {} : { actionId: "Manual" },
      },
    };
    addNode(newNode);
    setShowWorkflowPanel(true);
  };

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
      <Button
        className="border hover:bg-black/5 disabled:opacity-100 dark:hover:bg-white/5 disabled:[&>svg]:text-muted-foreground"
        disabled={isGenerating}
        onClick={handleAddStep}
        size="icon"
        title="Add Step"
        variant="secondary"
      >
        <Plus />
      </Button>

      <ButtonGroup orientation="vertical">
        <Button
          className="border hover:bg-black/5 disabled:opacity-100 dark:hover:bg-white/5 disabled:[&>svg]:text-muted-foreground"
          disabled={!canUndo || isGenerating}
          onClick={() => undo()}
          size="icon"
          title="Undo"
          variant="secondary"
        >
          <Undo2 />
        </Button>
        <Button
          className="border hover:bg-black/5 disabled:opacity-100 dark:hover:bg-white/5 disabled:[&>svg]:text-muted-foreground"
          disabled={!canRedo || isGenerating}
          onClick={() => redo()}
          size="icon"
          title="Redo"
          variant="secondary"
        >
          <Redo2 />
        </Button>
      </ButtonGroup>

      <Button
        className="border hover:bg-black/5 disabled:opacity-100 dark:hover:bg-white/5 disabled:[&>svg]:text-muted-foreground"
        disabled={isExecuting || isGenerating}
        onClick={executeWorkflow}
        size="icon"
        title="Run Workflow"
        variant="secondary"
      >
        {isExecuting ? <Loader2 className="animate-spin" /> : <Play />}
      </Button>

      {selectedNode && (
        <ButtonGroup className="flex" orientation="vertical">
          <Button
            className="border hover:bg-black/5 dark:hover:bg-white/5"
            onClick={() => setShowWorkflowPanel(true)}
            size="icon"
            title="Properties"
            variant="secondary"
          >
            <Settings2 />
          </Button>

          <Button
            className="border hover:bg-black/5 dark:hover:bg-white/5"
            onClick={() => setShowDeleteAlert(true)}
            size="icon"
            title="Delete"
            variant="secondary"
          >
            <Trash2 />
          </Button>
        </ButtonGroup>
      )}

      <AlertDialog onOpenChange={setShowDeleteAlert} open={showDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedNode ? "Node" : "Connection"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this{" "}
              {selectedNode ? "node" : "connection"}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
