"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CredentialsManager } from "./credentials-manager";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CredentialsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CredentialsDialog({
  open,
  onOpenChange,
}: CredentialsDialogProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className="max-h-[90vh] max-w-4xl overflow-y-auto"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>Credentials</DialogTitle>
          <DialogDescription>
            Manage your credentials that can be used across workflows
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <CredentialsManager
            showCreateDialog={showCreateDialog}
            setShowCreateDialog={setShowCreateDialog}
          />
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button onClick={() => setShowCreateDialog(true)} variant="outline">
            <Plus className="mr-2 size-4" />
            Add Credential
          </Button>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
