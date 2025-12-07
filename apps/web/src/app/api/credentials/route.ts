import { credentialsCreateInput } from "@/lib/api-client";
import { PaginatedParams } from "@/lib/pagination";
import { prisma } from "@n8n/db";
import { ProviderType } from "@n8n/actions/types";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const {
      query,
      limit = 10,
      skip = 0,
      orderBy = "desc",
      orderByField = "createdAt",
      projectId,
      type,
    } = Object.fromEntries(req.nextUrl.searchParams.entries()) as Partial<
      PaginatedParams & { projectId: string; type?: ProviderType }
    >;

    const userId = req.headers.get("x-user-id") as string;

    const credentials = await prisma.credentials.findMany({
      where: {
        ...(query && { name: { contains: query, mode: "insensitive" } }),
        ...(projectId && { projectId }),
        ...(type && { type }),
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
    return NextResponse.json(credentials);
  } catch (error) {
    console.error("Error getting credentials", error);
    return Response.json(
      { error: "Failed to get credentials" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = (await req.json()) as credentialsCreateInput;
    const userId = req.headers.get("x-user-id") as string;

    const credential = await prisma.credentials.create({
      data: {
        ...data,
        projectId: undefined,
        project: {
          connect: {
            id: data.projectId,
            userId,
          },
        },
      },
    });

    return Response.json(credential);
  } catch (error) {
    return Response.json(
      { error: "Failed to create credential" },
      { status: 500 },
    );
  }
}
