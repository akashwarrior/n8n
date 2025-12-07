"use client";

import Link from "next/link";
import { Input } from "../ui/input";
import { useState } from "react";
import { api, Workflows } from "@/lib/api-client";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import {
  isGeneratingAtom,
  hasUnsavedChangesAtom,
  showExecutionTabAtom,
  autosaveAtom,
} from "@/store/workflow-store";

type WorkflowHeaderProps = {
  workflow: Pick<Workflows, "name" | "isActive" | "id"> & {
    project: { name: string; id: string };
  };
};

export const WorkflowHeader = ({ workflow }: WorkflowHeaderProps) => {
  const router = useRouter();

  const [workflowName, setWorkflowName] = useState(workflow.name);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExecutionTab, setShowExecutionTab] = useAtom(showExecutionTabAtom);

  const isGenerating = useAtomValue(isGeneratingAtom);
  const autoSave = useSetAtom(autosaveAtom);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useAtom(
    hasUnsavedChangesAtom,
  );

  const handleSave = async () => {
    setIsSaving(true);
    await autoSave({ immediate: true });
    setIsSaving(false);
  };

  const handleDeleteWorkflow = async () => {
    try {
      await api.workflow.delete({ id: workflow.id });
      toast.success("Workflow deleted successfully");
      router.replace("/");
    } catch (error) {
      console.error("Failed to delete workflow:", error);
      toast.error("Failed to delete workflow. Please try again.");
    }
  };

  const handleWorkflowNameChange = async () => {
    try {
      setHasUnsavedChanges(true);
      workflow.name = workflowName;
      await api.workflow.update({ id: workflow.id, name: workflowName });
    } catch (error) {
      toast.error("Could not update workflow name");
    } finally {
      setHasUnsavedChanges(false);
    }
  };

  return (
    <>
      <header className="flex items-center justify-between bg-sidebar border-b relative py-4 px-6">
        <div className="flex items-center gap-2 text-sm">
          <Link href={`/projects/${workflow.project.id}`}>
            <p>{workflow.project.name}</p>
          </Link>
          {" / "}
          <Input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
                handleWorkflowNameChange();
              } else if (e.key === "Escape") {
                setWorkflowName(workflow.name);
                e.currentTarget.blur();
              }
            }}
            onBlur={() => {
              if (!workflowName.trim()) {
                setWorkflowName(workflow.name);
                return;
              }
              if (workflowName !== workflow.name) {
                setHasUnsavedChanges(true);
              }
            }}
            className="bg-transparent! border-transparent hover:border-input text-sm ring-0! field-sizing-content max-w-sm"
          />
        </div>

        <div className="absolute right-0 left-0 flex z-40 top-4/5 md:top-2/3 m-auto w-fit bg-sidebar border rounded-lg p-1 gap-1 h-fit">
          <Button
            size="sm"
            key="Editor"
            variant={showExecutionTab ? "ghost" : "outline"}
            onClick={() => setShowExecutionTab(false)}
          >
            Editor
          </Button>

          <Button
            size="sm"
            key="Executions"
            variant={showExecutionTab ? "outline" : "ghost"}
            onClick={() => setShowExecutionTab(true)}
          >
            Executions
          </Button>
        </div>

        <div className="flex items-center gap-5">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleSave}
            disabled={isGenerating || isSaving || !hasUnsavedChanges}
            title={isSaving ? "Saving..." : "Save workflow"}
            className="relative"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
            {hasUnsavedChanges && !isSaving ? "Save" : "Saved"}
          </Button>
        </div>
      </header>

      <Dialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workflow</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this workflow? This will
              permanently delete the workflow. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowDeleteDialog(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleDeleteWorkflow} variant="destructive">
              Delete Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
