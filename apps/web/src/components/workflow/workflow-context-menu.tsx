"use client";

import { useReactFlow, type Node, type XYPosition } from "@xyflow/react";
import { useSetAtom } from "jotai";
import { Plus, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  addNodeAtom,
  deleteNodeAtom,
  showWorkflowPanelAtom,
  type WorkflowNode,
} from "@/store/workflow-store";

export type ContextMenuType = "node" | "pane" | null;

export type ContextMenuState = {
  type: ContextMenuType;
  position: { x: number; y: number };
  flowPosition?: XYPosition;
  nodeId?: string;
} | null;

type WorkflowContextMenuProps = {
  menuState: ContextMenuState;
  onClose: () => void;
};

export function WorkflowContextMenu({
  menuState,
  onClose,
}: WorkflowContextMenuProps) {
  const { getNode } = useReactFlow();
  const deleteNode = useSetAtom(deleteNodeAtom);
  const addNode = useSetAtom(addNodeAtom);
  const setShowWorkflowPanel = useSetAtom(showWorkflowPanelAtom);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleDeleteNode = useCallback(() => {
    if (menuState?.nodeId) {
      deleteNode(menuState.nodeId);
    }
    onClose();
  }, [menuState, deleteNode, onClose]);

  const handleAddNode = useCallback(() => {
    if (menuState?.flowPosition) {
      const nodeHeight = 192;
      const newNode: WorkflowNode = {
        id: nanoid(),
        type: "action",
        position: {
          x: menuState.flowPosition.x,
          y: menuState.flowPosition.y - nodeHeight / 2,
        },
        data: {
          label: "",
          description: "",
          config: {},
          status: "idle",
        },
        selected: true,
      };
      addNode(newNode);
      setShowWorkflowPanel(true);
    }
    onClose();
  }, [menuState, addNode, setShowWorkflowPanel, onClose]);

  useEffect(() => {
    if (!menuState) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as globalThis.Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuState, onClose]);

  if (!menuState) {
    return null;
  }

  const getNodeLabel = () => {
    if (!menuState.nodeId) {
      return "Node";
    }
    const node = getNode(menuState.nodeId);
    return node?.data.label || "Node";
  };

  return (
    <div
      ref={menuRef}
      className="fade-in-0 zoom-in-95 fixed z-50 min-w-32 animate-in overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
      style={{
        left: menuState.position.x,
        top: menuState.position.y,
      }}
    >
      {menuState.type === "node" && (
        <MenuItem
          icon={<Trash2 className="size-4" />}
          label={`Delete ${getNodeLabel()}`}
          onClick={handleDeleteNode}
          variant="destructive"
        />
      )}

      {menuState.type === "pane" && (
        <MenuItem
          icon={<Plus className="size-4" />}
          label="Add Node"
          onClick={handleAddNode}
        />
      )}
    </div>
  );
}

type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
};

function MenuItem({
  icon,
  label,
  onClick,
  variant = "default",
  disabled,
}: MenuItemProps) {
  return (
    <button
      className={cn(
        "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        variant === "destructive" &&
          "text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive",
        disabled && "pointer-events-none opacity-50",
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

export function useContextMenuHandlers(
  screenToFlowPosition: (position: { x: number; y: number }) => XYPosition,
  setMenuState: (state: ContextMenuState) => void,
) {
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setMenuState({
        type: "node",
        position: { x: event.clientX, y: event.clientY },
        nodeId: node.id,
      });
    },
    [setMenuState],
  );

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      event.preventDefault();
      const flowPosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      setMenuState({
        type: "pane",
        position: { x: event.clientX, y: event.clientY },
        flowPosition,
      });
    },
    [screenToFlowPosition, setMenuState],
  );

  return {
    onNodeContextMenu,
    onPaneContextMenu,
  };
}
