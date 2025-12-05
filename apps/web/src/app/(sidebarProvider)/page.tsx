import { SectionProject } from "@/components/section-project";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center p-6 lg:p-10 gap-8 md:gap-10 w-full max-w-7xl">
      <SiteHeader
        title="Overview"
        description="All the workflows, credentials and executions you have access to"
      />
      <SectionCards />
      <SectionProject projectId={null} />
    </div>
  );
}
