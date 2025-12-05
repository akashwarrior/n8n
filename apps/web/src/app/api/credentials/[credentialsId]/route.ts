import { credentialsUpdateInput } from "@/lib/api-client";
import { prisma } from "@n8n/db";
import { NextResponse } from "next/server";

type CredentialsIdParams = { params: Promise<{ credentialsId: string }> };

export async function GET(req: Request, { params }: CredentialsIdParams) {
  try {
    const { credentialsId } = await params;
    const userId = req.headers.get("x-user-id") as string;

    const credentials = await prisma.credentials.findUnique({
      where: {
        id: credentialsId,
        project: {
          userId,
        },
      },
    });

    if (!credentials) {
      return NextResponse.json(
        { error: "Credentials not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(credentials);
  } catch (error) {
    console.error("Failed to get credentials:", error);
    return NextResponse.json(
      { error: "Failed to get credentials" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request, { params }: CredentialsIdParams) {
  try {
    const { credentialsId } = await params;
    const credentialsData = (await req.json()) as credentialsUpdateInput;
    const userId = req.headers.get("x-user-id") as string;

    const credentials = await prisma.credentials.update({
      where: {
        id: credentialsId,
        project: {
          userId,
        },
      },
      data: credentialsData,
    });

    return NextResponse.json(credentials);
  } catch (error) {
    console.error("Failed to update credentials:", error);
    return NextResponse.json(
      { error: "Failed to update credentials" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request, { params }: CredentialsIdParams) {
  try {
    const { credentialsId } = await params;
    const userId = req.headers.get("x-user-id") as string;

    await prisma.credentials.delete({
      where: {
        id: credentialsId,
        project: {
          userId,
        },
      },
    });

    return NextResponse.json({ message: "Credentials deleted successfully" });
  } catch (error) {
    console.error("Failed to delete credentials:", error);
    return NextResponse.json(
      { error: "Failed to delete credentials" },
      { status: 500 },
    );
  }
}
