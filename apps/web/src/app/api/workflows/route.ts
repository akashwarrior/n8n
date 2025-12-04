import type { WorkflowCreateInput } from "@/lib/api-client";
import type { NextRequest } from "next/server";
import { prisma } from "@n8n/db";
import { PaginatedParams } from "@/lib/pagination";

export async function GET(req: NextRequest) {
  try {
    const {
      query,
      limit = 10,
      skip = 0,
      orderBy = "desc",
      orderByField = "createdAt",
      projectId = null,
    } = Object.fromEntries(
      req.nextUrl.searchParams.entries()
    ) as Partial<PaginatedParams & { projectId: string }>;
    
    const userId = req.headers.get("x-user-id") as string;

    const workflows = await prisma.workflows.findMany({
      where: {
        ...(query && { name: { contains: query, mode: "insensitive" } }),
        ...(projectId && { projectId }),
        project: {
          userId,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      skip: Number(skip),
      take: Math.min(Number(limit), 20),
      orderBy: {
        [orderByField]: orderBy,
      },
    });

    return Response.json(workflows);
  } catch (error) {
    console.error("Error getting workflows", error);
    return Response.json({ error: "Failed to get workflows" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as WorkflowCreateInput;

    const workflow = await prisma.workflows.create({
      data: data,
    });

    return Response.json(workflow);
  } catch (error) {
    return Response.json(
      { error: "Failed to create workflow" },
      { status: 500 },
    );
  }
}