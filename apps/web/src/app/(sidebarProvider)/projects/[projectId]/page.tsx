import { SectionProject } from "@/components/section-project";
import { SiteHeader } from "@/components/site-header";
import { defaultParams, keyBuilder } from "@/lib/pagination";
import { prisma } from "@n8n/db";
import { unstable_serialize } from "swr/infinite";
import { notFound } from "next/navigation";
import { SWRConfig } from "swr";
import { headers } from "next/headers";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const [headersList, { projectId }] = await Promise.all([headers(), params]);
  const userId = headersList.get("x-user-id") as string;

  const [project, workflows] = await Promise.all([
    prisma.projects.findUnique({
      where: {
        id: projectId,
        userId,
      },
    }),
    prisma.workflows.findMany({
      where: { projectId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      skip: defaultParams.skip,
      take: defaultParams.limit,
      orderBy: {
        [defaultParams.orderByField]: defaultParams.orderBy,
      },
    }),
  ]);

  if (!project) {
    notFound();
  }

  const key = (index: number) =>
    keyBuilder(index, "/api/workflows", defaultParams, { projectId });

  const fallback: Record<string, unknown> = {
    [unstable_serialize(key)]: [workflows],
  };

  return (
    <div className="flex w-full max-w-7xl flex-col items-center justify-center gap-8 p-6 md:gap-10 lg:p-10">
      <SiteHeader
        title={project.name}
        description={`All the workflows, credentials and executions inside ${project.name}`}
      />
      <SWRConfig value={{ fallback }}>
        <SectionProject projectId={projectId} />
      </SWRConfig>
    </div>
  );
}
