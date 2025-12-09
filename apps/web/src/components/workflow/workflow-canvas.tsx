"use client";

import { useHydrateAtoms } from "jotai/utils";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import { Canvas } from "@/components/ai-elements/canvas";
import { Connection } from "@/components/ai-elements/connection";
import { Controls } from "@/components/ai-elements/controls";
import { WorkflowToolbar } from "@/components/workflow/workflow-toolbar";
import { nanoid } from "nanoid";
import { Edge } from "../ai-elements/edge";
import { AIPrompt } from "../ai-elements/prompt";
import { ActionNode } from "./nodes/action-node";
import {
  type ContextMenuState,
  useContextMenuHandlers,
  WorkflowContextMenu,
} from "./workflow-context-menu";
import {
  ConnectionMode,
  FinalConnectionState,
  type OnConnect,
  useReactFlow,
  type Connection as XYFlowConnection,
  type Edge as XYFlowEdge,
} from "@xyflow/react";
import {
  addNodeAtom,
  autosaveAtom,
  projectIdAtom,
  workflowIdAtom,
  edgesAtom,
  hasUnsavedChangesAtom,
  nodesAtom,
  onEdgesChangeAtom,
  onNodesChangeAtom,
  showWorkflowPanelAtom,
  WorkflowEdge,
  type WorkflowNode,
} from "@/store/workflow-store";

const nodeTypes = { action: ActionNode } as const;
const edgeTypes = { edge: Edge } as const;

const fitViewOptions = {
  maxZoom: 1,
  minZoom: 0.5,
  padding: 0.2,
  duration: 0,
} as const;

type WorkflowCanvasProps = {
  initialNodes: WorkflowNode[];
  initialEdges: WorkflowEdge[];
  projectId: string;
  workflowId: string;
};

export function WorkflowCanvas({
  initialNodes,
  initialEdges,
  projectId,
  workflowId,
}: WorkflowCanvasProps) {
  useHydrateAtoms([
    [nodesAtom, initialNodes],
    [edgesAtom, initialEdges],
    [projectIdAtom, projectId],
    [workflowIdAtom, workflowId],
  ] as const);
  const nodes = useAtomValue(nodesAtom);
  const [edges, setEdges] = useAtom(edgesAtom);
  const onNodesChange = useSetAtom(onNodesChangeAtom);
  const onEdgesChange = useSetAtom(onEdgesChangeAtom);
  const addNode = useSetAtom(addNodeAtom);
  const setHasUnsavedChanges = useSetAtom(hasUnsavedChangesAtom);
  const setShowWorkflowPanel = useSetAtom(showWorkflowPanelAtom);
  const triggerAutosave = useSetAtom(autosaveAtom);
  const { screenToFlowPosition } = useReactFlow();

  const [contextMenuState, setContextMenuState] =
    useState<ContextMenuState>(null);

  const { onNodeContextMenu, onPaneContextMenu } = useContextMenuHandlers(
    screenToFlowPosition,
    setContextMenuState,
  );

  const closeContextMenu = () => setContextMenuState(null);

  const isValidConnection = (connection: XYFlowConnection | XYFlowEdge) => {
    // Prevent self-connections
    if (connection.source === connection.target) {
      return false;
    }

    return true;
  };

  const onConnect: OnConnect = (connection: XYFlowConnection) => {
    const newEdge = {
      id: nanoid(),
      ...connection,
      type: "default",
    };
    setEdges([...edges, newEdge]);
    setHasUnsavedChanges(true);
    triggerAutosave({ immediate: true });
  };

  const onConnectEnd = (
    event: MouseEvent | TouchEvent,
    connectionState: FinalConnectionState,
  ) => {
    if (connectionState.isValid || !connectionState.fromNode) {
      return;
    }

    const { clientX, clientY } =
      "changedTouches" in event ? event.changedTouches[0] : event;

    const position = screenToFlowPosition({
      x: clientX,
      y: clientY,
    });
    const nodeHeight = 192;
    position.y -= nodeHeight / 2;

    const newNode: WorkflowNode = {
      id: nanoid(),
      type: "action",
      position,
      data: {},
    };

    const newEdge = {
      id: nanoid(),
      source: connectionState.fromNode.id,
      target: newNode.id,
      type: "edge",
    };

    addNode(newNode);
    setEdges([...edges, newEdge]);
    setHasUnsavedChanges(true);
    setShowWorkflowPanel(true);
    triggerAutosave({ immediate: true });
  };

  const onPaneClick = () => {
    closeContextMenu();
    setShowWorkflowPanel(false);
  };

  const onNodeDoubleClick = () => setShowWorkflowPanel((prev) => !prev);

  return (
    <div className="relative h-full w-full bg-background">
      <div className="pointer-events-auto">
        <WorkflowToolbar />
      </div>

      <Canvas
        connectionLineComponent={Connection}
        connectionMode={ConnectionMode.Strict}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        isValidConnection={isValidConnection}
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeContextMenu={onNodeContextMenu}
        onNodeDoubleClick={onNodeDoubleClick}
        edges={edges}
        edgeTypes={edgeTypes}
        onEdgesChange={onEdgesChange}
        onEdgeContextMenu={(e) => e.preventDefault()}
        onPaneClick={onPaneClick}
        onPaneContextMenu={onPaneContextMenu}
        fitViewOptions={fitViewOptions}
        fitView={true}
      >
        <Controls
          fitViewOptions={fitViewOptions}
          orientation="horizontal"
          showInteractive={true}
          showFitView={true}
          showZoom={true}
        />
      </Canvas>

      <AIPrompt />

      <WorkflowContextMenu
        menuState={contextMenuState}
        onClose={closeContextMenu}
      />
    </div>
  );
}
