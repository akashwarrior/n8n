import { prisma } from "@n8n/db";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { ReactFlowProvider } from "@xyflow/react";
import { WorkflowHeader } from "@/components/workflow/workflow-header";
import { WorkflowCanvas } from "@/components/workflow/workflow-canvas";
import { WorkflowSidebarPanel } from "@/components/workflow/workflow-sidebar-panel";
import type { WorkflowEdge, WorkflowNode } from "@/store/workflow-store";

type WorkflowPageProps = {
  params: Promise<{ workflowId: string }>;
};

export default async function WorkflowPage({ params }: WorkflowPageProps) {
  const [cookiesList, headersList, { workflowId }] = await Promise.all([
    cookies(),
    headers(),
    params,
  ]);

  const sidebarWidth = parseFloat(
    cookiesList.get("sidebar-width")?.value || "25",
  );

  const userId = headersList.get("x-user-id") as string;

  const workflow = await prisma.workflows.findUnique({
    where: {
      id: workflowId,
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          userId: true,
        },
      },
    },
  });

  if (!workflow || workflow.project.userId !== userId) {
    notFound();
  }

  const nodes = (workflow.nodes as unknown as WorkflowNode[]) || [];
  const edges = (workflow.edges as unknown as WorkflowEdge[]) || [];

  return (
    <ReactFlowProvider>
      <div className="relative h-full w-full overflow-hidden flex flex-col">
        <WorkflowHeader workflow={workflow} />

        <div className="relative w-full h-full">
          <WorkflowCanvas
            initialNodes={nodes.map((node) => ({
              ...node,
              selected: false,
              status: "idle",
            }))}
            initialEdges={edges}
            workflowId={workflowId}
            projectId={workflow.project.id}
          />

          <WorkflowSidebarPanel defaultPanelWidth={sidebarWidth} />
        </div>
      </div>
    </ReactFlowProvider>
  );
}
