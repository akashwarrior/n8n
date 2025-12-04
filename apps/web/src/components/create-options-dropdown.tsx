"use client";

import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { unstable_serialize } from "swr/infinite";
import { mutate } from "swr";
import { Slot } from "@radix-ui/react-slot";
import { ButtonGroupSeparator } from "./ui/button-group";
import { keyBuilder } from "@/lib/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CreateOptionsDropdown({
  children,
  createWorkflow,
}: {
  children: React.ReactNode;
  createWorkflow?: React.ReactNode;
}) {
  const Comp = Slot;
  const router = useRouter();
  const handleCreateCredential = () => {
    console.log("create credential");
  };

  const handleCreateProject = async () => {
    const createProjectResponse = api.projects.create({
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

  const handleCreateWorkflow = () => {
    const createWorkflowResponse = api.workflows.create({
      projectId: "MdR02lKQv1EuYoA5_gy6M",
      name: "New Workflow",
      nodes: [],
      edges: [],
    });

    toast.promise(createWorkflowResponse, {
      loading: "Creating workflow...",
      success: (workflow) => {
        console.log(workflow);
        mutate(
          unstable_serialize((index) => keyBuilder(index, "/api/workflows")),
        );
        return "Workflow created successfully";
      },
      error: "Failed to create workflow",
    });
  };

  return (
    <DropdownMenu modal={false}>
      {createWorkflow && (
        <>
          <Comp onClick={handleCreateWorkflow}>{createWorkflow}</Comp>
          <ButtonGroupSeparator />
        </>
      )}
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

      <DropdownMenuContent className="w-58">
        {!createWorkflow && (
          <DropdownMenuItem onClick={handleCreateWorkflow}>
            Create Workflow
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={handleCreateCredential}>
          Create Credential
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleCreateProject}>
          Create Project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
