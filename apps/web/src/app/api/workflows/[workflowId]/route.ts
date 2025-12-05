import type { WorkflowUpdateInput } from "@/lib/api-client";
import { prisma } from "@n8n/db";

type WorkflowIdParams = { params: Promise<{ workflowId: string }> };

export async function GET(req: Request, { params }: WorkflowIdParams) {
  try {
    const { workflowId } = await params;
    const userId = req.headers.get("x-user-id") as string;

    const workflow = await prisma.workflows.findUnique({
      where: {
        id: workflowId,
        project: {
          userId,
        },
      },
    });
    return Response.json(workflow);
  } catch (error) {
    return Response.json({ error: "Failed to get workflow" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: WorkflowIdParams) {
  try {
    const { workflowId } = await params;
    const userId = req.headers.get("x-user-id") as string;
    const workflowData = (await req.json()) as WorkflowUpdateInput;

    const workflow = await prisma.workflows.update({
      where: {
        id: workflowId,
        project: {
          userId,
        },
      },
      data: workflowData,
    });
    return Response.json(workflow);
  } catch (error) {
    console.error("Error updating workflow:", error);
    return Response.json(
      { error: "Failed to update workflow" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request, { params }: WorkflowIdParams) {
  try {
    const { workflowId } = await params;
    const userId = req.headers.get("x-user-id") as string;

    await prisma.workflows.delete({
      where: {
        id: workflowId,
        project: {
          userId,
        },
      },
    });
    return Response.json({ message: "Workflow deleted successfully" });
  } catch (error) {
    return Response.json(
      { error: "Failed to delete workflow" },
      { status: 500 },
    );
  }
}
