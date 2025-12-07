"use client";

import { toast } from "sonner";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { api, Credentials } from "@/lib/api-client";
import { PROVIDERS } from "@n8n/actions";
import { ProviderType } from "@n8n/actions/types";
import { projectIdAtom } from "@/store/workflow-store";
import { CredentialsFormDialog } from "../credentials-form-dialog";
import { ActionIcon } from "@/components/ui/action-icon";
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

const ACTION_TYPE_LABELS = PROVIDERS.reduce(
  (acc, curr) => {
    acc[curr.type] = curr.label;
    return acc;
  },
  {} as Record<ProviderType, string>,
);

type CredentialsManagerProps = {
  showCreateDialog: boolean;
  setShowCreateDialog: (open: boolean) => void;
};

export function CredentialsManager({
  showCreateDialog,
  setShowCreateDialog,
}: CredentialsManagerProps) {
  const projectId = useAtomValue(projectIdAtom);
  const [credentials, setCredentials] = useState<Credentials[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCredential, setEditingCredential] =
    useState<Credentials | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const data = await api.credential.getAll({
        projectId: projectId as string,
      });
      setCredentials(data);
    } catch (error) {
      console.error("Failed to load credentials:", error);
      toast.error("Failed to load credentials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCredentials();
  }, []);

  const handleDelete = async (id: string | null) => {
    if (!id) {
      return;
    }
    try {
      await api.credential.delete({ credentialId: id });
      toast.success("Credential deleted");
      await loadCredentials();
    } catch (error) {
      console.error("Failed to delete credential:", error);
      toast.error("Failed to delete credential");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDialogClose = () => {
    setShowCreateDialog(false);
    setEditingCredential(null);
  };

  const handleDialogSuccess = async () => {
    await loadCredentials();
    setShowCreateDialog(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {credentials.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center">
          <p className="text-muted-foreground text-sm">
            No credentials configured yet
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {credentials.map((credential) => (
            <div
              className="flex items-center justify-between rounded-lg border p-4"
              key={credential.id}
            >
              <div className="flex items-center gap-3">
                <ActionIcon className="size-8" type={credential.type} />
                <div>
                  <p className="font-medium text-sm">{credential.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {ACTION_TYPE_LABELS[credential.type]}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setEditingCredential(credential)}
                  size="sm"
                  variant="outline"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  onClick={() => setDeletingId(credential.id)}
                  size="sm"
                  variant="outline"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showCreateDialog || editingCredential) && (
        <CredentialsFormDialog
          open
          mode={editingCredential ? "edit" : "create"}
          credentials={editingCredential}
          onClose={handleDialogClose}
          onSuccess={handleDialogSuccess}
        />
      )}

      <AlertDialog
        onOpenChange={(open) => !open && setDeletingId(null)}
        open={deletingId !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Credential</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this credential? Workflows using
              this credential will fail until a new one is selected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(deletingId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
