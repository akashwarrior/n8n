import { projectUpdateInput } from "@/lib/api-client";
import { prisma } from "@n8n/db";

type ProjectIdParam = { params: Promise<{ projectId: string }> };

export async function PATCH(req: Request, { params }: ProjectIdParam) {
  try {
    const [data, { projectId }] = await Promise.all([
      req.json() as Promise<projectUpdateInput>,
      params,
    ]);

    const userId = req.headers.get("x-user-id") as string;

    const project = await prisma.projects.update({
      where: {
        id: projectId,
        userId: userId,
      },
      data: data,
    });
    return Response.json(project);
  } catch (error) {
    return Response.json(
      { error: "Failed to update project" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request, { params }: ProjectIdParam) {
  try {
    const { projectId } = await params;
    const userId = req.headers.get("x-user-id") as string;

    const project = await prisma.projects.delete({
      where: {
        id: projectId,
        userId: userId,
      },
    });

    return Response.json(project);
  } catch (error) {
    return Response.json(
      { error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
