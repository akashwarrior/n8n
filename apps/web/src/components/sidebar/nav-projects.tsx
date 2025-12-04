"use client";

import Link from "next/link";
import { mutate } from "swr";
import { toast } from "sonner";
import { motion } from "motion/react";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { useIsMobile } from "@/hooks/use-mobile";
import { unstable_serialize } from "swr/infinite";
import { RenameDialog, RenameState } from "../rename-dialog";
import type { Projects, Workflows } from "@n8n/db";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { keyBuilder } from "@/lib/pagination";
import {
  IconDots,
  IconEdit,
  IconTrash,
  IconFileCode2,
} from "@tabler/icons-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavProjects() {
  const {
    items: projects,
    mutate: mutateProjects,
    hasMore,
    loadMore,
    validating,
  } = usePaginatedList<Projects>({
    endpoint: "/api/projects",
  });
  const [renameState, setRenameState] = useState<RenameState | null>(null);
  const isMobile = useIsMobile();

  const handleRenameSuccess = async ({ id, name }: RenameState) => {
    await Promise.all([
      mutateProjects(
        (prev) =>
          prev?.map((projects) =>
            projects.map((project) =>
              project.id === id ? { ...project, name } : project,
            ),
          ),
        false,
      ),
      mutate<(Workflows & { projects: Pick<Projects, "name" | "id"> })[][]>(
        unstable_serialize((index) => keyBuilder(index, "/api/workflows")),
        (prev) =>
          prev?.map((wfs) =>
            wfs.map((wf) =>
              wf.projectId === id
                ? { ...wf, project: { ...wf.projects, name } }
                : wf,
            ),
          ),
        false,
      ),
    ]);
  };

  const handleDelete = async (projectId: string) => {
    const deleteProjectResponse = api.projects.delete({
      projectId: projectId,
    });

    toast.promise(deleteProjectResponse, {
      loading: "Deleting project...",
      success: async () => {
        await mutateProjects(
          (prev) =>
            prev?.map((projects) =>
              projects.filter((project) => project.id !== projectId),
            ),
          false,
        );
        await mutate<Workflows[][]>(
          unstable_serialize((index) => keyBuilder(index, "/api/workflows")),
          (prev) =>
            prev?.map((wfs) => wfs.filter((wf) => wf.projectId !== projectId)),
          false,
        );
        return "Project deleted successfully";
      },
      error: "Failed to delete project",
    });
  };

  return (
    <SidebarGroup className="overflow-hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu className="overflow-y-auto group-data-[collapsible=icon]:[&::-webkit-scrollbar]:hidden">
        {projects.flat().map((project) => (
          <SidebarMenuItem key={project.id}>
            <SidebarMenuButton asChild tooltip={project.name}>
              <Link href={`/projects/${project.id}`} prefetch={false}>
                <IconFileCode2 />
                <span>{project.name}</span>
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction className="data-[state=open]:bg-accent rounded-sm">
                  <IconDots />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-24 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem onClick={() => setRenameState(project)}>
                  <IconEdit />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => handleDelete(project.id)}
                >
                  <IconTrash />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}

        {hasMore && !validating && (
          <motion.div className="h-4" onViewportEnter={loadMore} />
        )}
      </SidebarMenu>

      <RenameDialog
        title="Project"
        renameState={renameState}
        onRename={api.projects.update}
        onSuccess={handleRenameSuccess}
        setIsOpen={(open) => !open && setRenameState(null)}
      />
    </SidebarGroup>
  );
}
