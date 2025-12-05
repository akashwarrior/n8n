import type { projectCreateInput } from "@/lib/api-client";
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
    } = Object.fromEntries(
      req.nextUrl.searchParams.entries(),
    ) as Partial<PaginatedParams>;

    const userId = req.headers.get("x-user-id") as string;

    const projects = await prisma.projects.findMany({
      where: {
        ...(query && { name: { contains: query, mode: "insensitive" } }),
        userId: userId,
      },
      skip: Number(skip),
      take: Math.min(Number(limit), 20),
      orderBy: {
        [orderByField]: orderBy,
      },
    });

    return Response.json(projects);
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Failed to get projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as projectCreateInput;
    const userId = req.headers.get("x-user-id") as string;

    const project = await prisma.projects.create({
      data: {
        ...data,
        userId: userId,
      },
    });
    return Response.json(project);
  } catch (error) {
    return Response.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}
