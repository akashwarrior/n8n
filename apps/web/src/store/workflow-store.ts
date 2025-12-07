import type { Edge, EdgeChange, Node, NodeChange } from "@xyflow/react";
import { applyEdgeChanges, applyNodeChanges } from "@xyflow/react";
import { atom } from "jotai";
import { api } from "@/lib/api-client";
import type { ProviderType } from "@n8n/actions/types";

export type WorkflowNodeData = {
  label?: string;
  description?: string;
  provider?: ProviderType;
  config?: Record<string, unknown>;
  status?: "idle" | "running" | "success" | "error";
  enabled?: boolean;
  onClick?: () => void;
};

export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge;

export const nodesAtom = atom<WorkflowNode[]>([]);
export const edgesAtom = atom<WorkflowEdge[]>([]);
export const selectedNodeIdAtom = atom<string | null>(null);
export const isGeneratingAtom = atom(false);
export const showWorkflowPanelAtom = atom(false);

export const workflowIdAtom = atom<string>("");
export const projectIdAtom = atom<string>("");
export const showExecutionTabAtom = atom<boolean>(false);

let autosaveTimeoutId: NodeJS.Timeout | null = null;
const AUTOSAVE_DELAY = 1000;

export const autosaveAtom = atom(
  null,
  async (get, set, options?: { immediate: boolean }) => {
    const workflowId = get(workflowIdAtom);
    const nodes = get(nodesAtom);
    const edges = get(edgesAtom);

    const saveFunc = async () => {
      try {
        await api.workflow.update({ id: workflowId, nodes, edges });
        set(hasUnsavedChangesAtom, false);
      } catch (error) {
        console.error("Autosave failed:", error);
      }
    };

    if (options?.immediate) {
      await saveFunc();
    } else {
      if (autosaveTimeoutId) {
        clearTimeout(autosaveTimeoutId);
      }
      autosaveTimeoutId = setTimeout(saveFunc, AUTOSAVE_DELAY);
    }
  },
);

export const onNodesChangeAtom = atom(
  null,
  (get, set, changes: NodeChange[]) => {
    const currentNodes = get(nodesAtom);
    const newNodes = applyNodeChanges(changes, currentNodes) as WorkflowNode[];
    set(nodesAtom, newNodes);
    set(autosaveAtom);

    for (const change of changes) {
      if (change.type === "select") {
        if (change.selected) {
          set(selectedNodeIdAtom, change.id);
        } else if (change.id == get(selectedNodeIdAtom)) {
          set(selectedNodeIdAtom, null);
        }
      } else if (change.type === "remove") {
        if (
          get(selectedNodeIdAtom) == null ||
          change.id === get(selectedNodeIdAtom)
        ) {
          set(showWorkflowPanelAtom, false);
          set(selectedNodeIdAtom, null);
        }
      }
    }
  },
);

export const onEdgesChangeAtom = atom(
  null,
  (get, set, changes: EdgeChange[]) => {
    const currentEdges = get(edgesAtom);
    const newEdges = applyEdgeChanges(changes, currentEdges);
    set(edgesAtom, newEdges);

    const hadDeletions = changes.some((change) => change.type === "remove");
    set(autosaveAtom, { immediate: hadDeletions });
  },
);

export const addNodeAtom = atom(null, (get, set, node: WorkflowNode) => {
  const currentNodes = get(nodesAtom);
  const currentEdges = get(edgesAtom);
  const history = get(historyAtom);

  set(historyAtom, [...history, { nodes: currentNodes, edges: currentEdges }]);
  set(futureAtom, []);

  const newNode = { ...node, selected: true };
  set(nodesAtom, [
    ...currentNodes.map((node) => ({ ...node, selected: false })),
    newNode,
  ]);
  set(hasUnsavedChangesAtom, true);
  set(selectedNodeIdAtom, newNode.id);
  set(autosaveAtom, { immediate: true });
});

export const updateNodeAtom = atom(
  null,
  (get, set, { id, data }: { id: string; data: Partial<WorkflowNodeData> }) => {
    const currentNodes = get(nodesAtom);

    const newNodes = currentNodes.map((node) => {
      if (node.id === id) {
        return {
          ...node,
          data: { ...node.data, ...data },
        };
      }
      return node;
    });

    set(nodesAtom, newNodes);
    set(hasUnsavedChangesAtom, true);
    set(autosaveAtom);
  },
);

export const deleteNodeAtom = atom(null, (get, set, nodeId: string) => {
  const currentNodes = get(nodesAtom);

  const currentEdges = get(edgesAtom);
  const history = get(historyAtom);
  set(historyAtom, [...history, { nodes: currentNodes, edges: currentEdges }]);
  set(futureAtom, []);

  const newNodes = currentNodes.filter((node) => node.id !== nodeId);
  set(nodesAtom, newNodes);

  set(hasUnsavedChangesAtom, true);

  set(autosaveAtom, { immediate: true });
});

export const deleteSelectedItemsAtom = atom(null, (get, set) => {
  const currentNodes = get(nodesAtom);
  const currentEdges = get(edgesAtom);
  const history = get(historyAtom);
  set(historyAtom, [...history, { nodes: currentNodes, edges: currentEdges }]);
  set(futureAtom, []);

  const newNodes = currentNodes.filter((node) => !node.selected);

  set(nodesAtom, newNodes);
  set(selectedNodeIdAtom, null);

  set(hasUnsavedChangesAtom, true);
  set(autosaveAtom, { immediate: true });
});

export const hasUnsavedChangesAtom = atom(false);

type HistoryState = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

const historyAtom = atom<HistoryState[]>([]);
const futureAtom = atom<HistoryState[]>([]);

export const undoAtom = atom(null, (get, set) => {
  const history = get(historyAtom);
  if (history.length === 0) {
    return;
  }

  const currentNodes = get(nodesAtom);
  const currentEdges = get(edgesAtom);
  const future = get(futureAtom);

  set(futureAtom, [...future, { nodes: currentNodes, edges: currentEdges }]);

  const newHistory = [...history];
  const previousState = newHistory.pop();
  if (!previousState) {
    return;
  }
  set(historyAtom, newHistory);
  set(nodesAtom, previousState.nodes);
  set(edgesAtom, previousState.edges);

  set(hasUnsavedChangesAtom, true);
});

export const redoAtom = atom(null, (get, set) => {
  const future = get(futureAtom);
  if (future.length === 0) {
    return;
  }

  const currentNodes = get(nodesAtom);
  const currentEdges = get(edgesAtom);
  const history = get(historyAtom);

  set(historyAtom, [...history, { nodes: currentNodes, edges: currentEdges }]);

  const newFuture = [...future];
  const nextState = newFuture.pop();
  if (!nextState) {
    return;
  }
  set(futureAtom, newFuture);
  set(nodesAtom, nextState.nodes);
  set(edgesAtom, nextState.edges);

  set(hasUnsavedChangesAtom, true);
});

export const canUndoAtom = atom((get) => get(historyAtom).length > 0);
export const canRedoAtom = atom((get) => get(futureAtom).length > 0);

export const clearNodeStatusesAtom = atom(null, (get, set) => {
  const currentNodes = get(nodesAtom);
  const newNodes = currentNodes.map((node) => ({
    ...node,
    data: { ...node.data, status: "idle" as const },
  }));
  set(nodesAtom, newNodes);
});
