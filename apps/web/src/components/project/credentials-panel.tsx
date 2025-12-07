"use client";

import { useMemo, useState } from "react";
import { intlFormat, intlFormatDistance } from "date-fns";

import type { RenameState } from "@/components/rename-dialog";
import { Projects } from "@n8n/db";
import { toast } from "sonner";
import { usePaginatedList } from "@/hooks/use-paginated-list";

import { ItemCard } from "./item-card";
import { ProjectWrapper } from "./project-wrapper";
import { api, Credentials } from "@/lib/api-client";
import { CredentialsFormDialog } from "../credentials-form-dialog";
import { useRouter } from "next/navigation";

type CredentialsPanelProps = {
  projectId: string | null;
};

interface CredentialWithProject extends Credentials {
  project: Pick<Projects, "name" | "id">;
}

export function CredentialsPanel({ projectId }: CredentialsPanelProps) {
  const router = useRouter();
  const [renameState, setRenameState] = useState<RenameState | null>(null);
  const {
    items: credentials,
    params,
    setParams,
    validating,
    activePage,
    setActivePage,
    hasMore,
    mutate,
    error,
  } = usePaginatedList<CredentialWithProject>({
    endpoint: "/api/credentials",
    ...(projectId && { params: { projectId } }),
  });

  const [selectedCredential, setSelectedCredential] =
    useState<CredentialWithProject | null>(null);

  const { currentPageItems, pagesCount, isEmpty, isLoadingPage } =
    useMemo(() => {
      const currentItems = credentials[activePage - 1] ?? [];
      const totalPages = credentials.length + (hasMore ? 1 : 0);
      const flatCount = credentials.flat().length;

      return {
        currentPageItems: currentItems,
        pagesCount: totalPages,
        isEmpty: !validating && flatCount === 0,
        isLoadingPage: validating && currentItems.length === 0,
      };
    }, [activePage, credentials, hasMore, validating]);

  const handleRename = async (data: RenameState) => {
    await api.credential.update(data);
    await mutate(
      (prev) =>
        prev?.map((page) =>
          page.map((cred) =>
            cred.id === data.id ? { ...cred, name: data.name } : cred,
          ),
        ),
      false,
    );
    setRenameState(null);
  };

  const handleDelete = async (credentialId: string) => {
    const credentialsDeletePromise = api.credential.delete({ credentialId });
    toast.promise(credentialsDeletePromise, {
      loading: "Deleting credential...",
      success: () => {
        mutate(
          (prev) =>
            prev?.map((page) =>
              page.filter((cred) => cred.id !== credentialId),
            ),
          false,
        );
        return "Credential deleted successfully.";
      },
      error: "Failed to delete credential.",
    });
  };

  return (
    <ProjectWrapper
      title="Credential"
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
      emptyMessage="No credentials found."
      errorMessage={
        error
          ? "Unable to load credentials. Please try again later."
          : undefined
      }
    >
      {currentPageItems.map((credential) => (
        <ItemCard
          key={credential.id}
          title={credential.name}
          projectName={credential.project.name}
          onOpen={() => setSelectedCredential(credential)}
          onRename={() => setRenameState(credential)}
          onDelete={() => handleDelete(credential.id)}
          openProject={() => router.push(`/projects/${credential.project.id}`)}
          description={[
            credential.type ?? "Credential",
            `Last updated ${intlFormatDistance(new Date(credential.updatedAt), new Date())}`,
            `Created ${intlFormat(new Date(credential.createdAt), { month: "long", day: "2-digit" })}`,
          ]}
        />
      ))}

      {selectedCredential && (
        <CredentialsFormDialog
          open={true}
          mode="edit"
          onClose={() => setSelectedCredential(null)}
          onSuccess={() => mutate()}
          credentials={selectedCredential}
        />
      )}
    </ProjectWrapper>
  );
}
