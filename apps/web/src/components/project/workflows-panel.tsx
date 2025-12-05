"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { intlFormat, intlFormatDistance } from "date-fns";

import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { RenameState } from "@/components/rename-dialog";
import { Projects, Workflows } from "@n8n/db";
import { usePaginatedList } from "@/hooks/use-paginated-list";

import { ItemCard } from "./item-card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ProjectWrapper } from "./project-wrapper";

type WorkflowsPanelProps = {
  projectId: string | null;
};

export function WorkflowsPanel({ projectId }: WorkflowsPanelProps) {
  const router = useRouter();
  const [renameState, setRenameState] = useState<RenameState | null>(null);
  const {
    items: workflows,
    mutate,
    params,
    validating,
    setParams,
    hasMore,
    activePage,
    setActivePage,
  } = usePaginatedList<Workflows & { project: Pick<Projects, "name" | "id"> }>({
    endpoint: "/api/workflows",
    params: projectId ? { projectId } : undefined,
  });

  const handleOpen = (workflowId: string) =>
    router.push(`/workflows/${workflowId}`);

  const handleDelete = (workflowId: string) => {
    toast.promise(
      api.workflow.delete({
        id: workflowId,
      }),
      {
        loading: "Deleting workflow...",
        success: () => {
          mutate(
            (prev) =>
              prev?.map((page) => page.filter((wf) => wf.id !== workflowId)),
            false,
          );
          return "Workflow deleted successfully!";
        },
        error: "Failed to delete workflow.",
      },
    );
  };

  const handleCheckedChange = async (workflowId: string, isActive: boolean) => {
    try {
      await api.workflow.update({
        id: workflowId,
        isActive,
      });
      mutate(
        (prev) =>
          prev?.map((page) =>
            page.map((wf) => (wf.id === workflowId ? { ...wf, isActive } : wf)),
          ),
        false,
      );
    } catch (error) {
      console.error("Failed to update workflow status", error);
      toast.error("Could not update workflow status");
    }
  };

  const handleRename = async (data: RenameState) => {
    return toast.promise(api.workflow.update(data), {
      loading: "Renaming workflow...",
      success: () => {
        mutate(
          (prev) =>
            prev?.map((page) =>
              page.map((wf) =>
                wf.id === data.id ? { ...wf, name: data.name } : wf,
              ),
            ),
          false,
        );
        setRenameState(null);
        return "Workflow renamed successfully!";
      },
      error: "Failed to rename workflow",
    });
  };

  const { currentPageItems, pagesCount, isEmpty, isLoadingPage } =
    useMemo(() => {
      const currentItems = workflows[activePage - 1] ?? [];
      const totalPages = workflows.length + (hasMore ? 1 : 0);
      const flatCount = workflows.flat().length;

      return {
        currentPageItems: currentItems,
        pagesCount: totalPages,
        isEmpty: !validating && flatCount === 0,
        isLoadingPage: validating && currentItems.length === 0,
      };
    }, [activePage, hasMore, validating, workflows]);

  const WorkflowStatus = ({ workflow }: { workflow: Workflows }) => {
    const switchId = `workflow-status-${workflow.id}`;

    return (
      <div className="flex items-center justify-center gap-3">
        <Label htmlFor={switchId}>
          {workflow.isActive ? "Active" : "Inactive"}
        </Label>
        <Switch
          id={switchId}
          checked={workflow.isActive}
          onCheckedChange={(isActive) =>
            handleCheckedChange(workflow.id, isActive)
          }
        />
      </div>
    );
  };

  return (
    <ProjectWrapper
      title="Workflow"
      emptyMessage="No workflows found."
      pages={pagesCount}
      activePage={activePage}
      isLoading={isLoadingPage}
      isEmpty={isEmpty}
      params={params}
      setParams={setParams}
      setActivePage={setActivePage}
      renameState={renameState}
      setRenameState={setRenameState}
      onRename={handleRename}
    >
      {currentPageItems.map((workflow) => (
        <ItemCard
          key={workflow.id}
          title={workflow.name}
          projectId={workflow.project.id}
          projectName={workflow.project.name}
          onOpen={() => handleOpen(workflow.id)}
          onRename={() => setRenameState(workflow)}
          onDelete={() => handleDelete(workflow.id)}
          status={<WorkflowStatus workflow={workflow} />}
          description={[
            `Last updated ${intlFormatDistance(new Date(workflow.updatedAt), new Date())}`,
            `Created ${intlFormat(new Date(workflow.createdAt), { month: "long", day: "2-digit" })}`,
          ]}
        />
      ))}
    </ProjectWrapper>
  );
}
