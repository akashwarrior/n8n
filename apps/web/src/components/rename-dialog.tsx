"use client ";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export type RenameState = {
  id: string;
  name: string;
};

type RenameDialogProps = {
  title: string;
  renameState: RenameState | null;
  setIsOpen: (open: boolean) => void;
  onRename: (data: RenameState) => Promise<any>;
};

export function RenameDialog({
  title,
  renameState,
  setIsOpen,
  onRename,
}: RenameDialogProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!renameState?.id) {
      toast.error(`No ${title} selected`);
      return;
    }

    const newName = nameInputRef.current?.value || "";

    if (!newName.trim()) {
      toast.error("Please enter a new name");
      return;
    }

    setLoading(true);
    const data = { id: renameState.id, name: newName };
    const renamePromise = onRename(data);

    toast.promise(renamePromise, {
      loading: `Renaming ${title}...`,
      success: `${title} renamed successfully!`,
      error: `Failed to rename ${title}`,
      finally: () => {
        setLoading(false);
        setIsOpen(false);
      },
    });
  };

  return (
    <Dialog open={!!renameState?.id} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename {title}</DialogTitle>
        </DialogHeader>
        <DialogDescription>Rename the {title} to a new name.</DialogDescription>
        <Input
          ref={nameInputRef}
          defaultValue={renameState?.name}
          type="text"
          placeholder="New name"
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit(e);
            }
          }}
        />
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button disabled={loading} onClick={handleSubmit}>
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
