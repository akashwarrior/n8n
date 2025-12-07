"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

export const MultiSelectionPanel = ({
  selectedNodes,
  onDelete,
}: {
  selectedNodes: { id: string; selected?: boolean }[];
  onDelete: () => void;
}) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const handleDelete = () => {
    onDelete();
    setShowDeleteAlert(false);
  };

  return (
    <>
      <div className="flex size-full flex-col">
        <div className="flex h-14 w-full shrink-0 items-center border-b bg-transparent px-4">
          <h2 className="font-semibold text-foreground">Properties</h2>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div className="space-y-2">
            <Label>Selection</Label>
            <p className="text-muted-foreground text-sm">
              {selectedNodes.length} nodes selected
            </p>
          </div>
        </div>
        <div className="shrink-0 border-t p-4">
          <Button
            onClick={() => setShowDeleteAlert(true)}
            size="icon"
            variant="ghost"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <AlertDialog onOpenChange={setShowDeleteAlert} open={showDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Items</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedNodes.length} nodes? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
