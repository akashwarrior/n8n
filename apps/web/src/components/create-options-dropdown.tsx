"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSetAtom } from "jotai";
import { api } from "@/lib/api-client";
import { useParams, useRouter } from "next/navigation";
import { unstable_serialize } from "swr/infinite";
import { mutate } from "swr";
import { Slot } from "@radix-ui/react-slot";
import { ButtonGroupSeparator } from "@/components/ui/button-group";
import { defaultParams, keyBuilder } from "@/lib/pagination";
import type { Projects } from "@n8n/db";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { CredentialsFormDialog } from "./credentials-form-dialog";
import { projectIdAtom } from "@/store/workflow-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CreateOptionsDropdown({
  children,
  createWorkflow,
}: {
  children: React.ReactNode;
  createWorkflow?: React.ReactNode;
}) {
  const { items: projects } = usePaginatedList<Projects>({
    endpoint: "/api/projects",
  });
  const Comp = Slot;
  const router = useRouter();
  const { projectId: projectIdParam } = useParams<{ projectId: string }>();
  const setProjectId = useSetAtom(projectIdAtom);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateProject = async () => {
    const createProjectResponse = api.project.create({
      name: "New Project",
    });

    toast.promise(createProjectResponse, {
      loading: "Creating project...",
      success: ({ id }) => {
        mutate(
          unstable_serialize((index) => keyBuilder(index, "/api/projects")),
        );
        router.push(`/projects/${id}`);
        return "Project created successfully";
      },
      error: "Failed to create project",
    });
  };

  const handleCreateWorkflow = (projectId: string) => {
    if (!projectId) {
      toast.error("No project selected");
      return;
    }

    const createWorkflowResponse = api.workflow.create({
      projectId: projectId,
      name: "New Workflow",
      nodes: [],
      edges: [],
    });

    toast.promise(createWorkflowResponse, {
      loading: "Creating workflow...",
      success: ({ id }) => {
        mutate(
          unstable_serialize((index) =>
            keyBuilder(index, "/api/workflows", defaultParams, { projectId }),
          ),
        );
        router.push(`/workflows/${id}`);
        return "Workflow created successfully";
      },
      error: "Failed to create workflow",
    });
  };

  return (
    <DropdownMenu modal={false}>
      {createWorkflow && (
        <>
          <Comp
            onClick={() =>
              handleCreateWorkflow(projectIdParam || projects[0][0].id)
            }
          >
            {createWorkflow}
          </Comp>
          <ButtonGroupSeparator />
        </>
      )}
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

      <DropdownMenuContent className="w-58">
        {!createWorkflow && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Create Workflow</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {projects.flat().map((project) => (
                  <DropdownMenuItem
                    key={project.id}
                    onClick={() => handleCreateWorkflow(project.id)}
                  >
                    {project.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        )}

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Create Credential</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {projects.flat().map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onClick={() => {
                    setDialogOpen(true);
                    setProjectId(project.id);
                  }}
                >
                  {project.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuItem onClick={handleCreateProject}>
          Create Project
        </DropdownMenuItem>
      </DropdownMenuContent>

      {dialogOpen && (
        <CredentialsFormDialog
          mode="create"
          onClose={() => setDialogOpen(false)}
          open={dialogOpen}
        />
      )}
    </DropdownMenu>
  );
}
