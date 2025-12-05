"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

import { ExecutionsPanel } from "@/components/project/executions-panel";
import { TransitionPanel } from "@/components/ui/transition-panel";
import { CredentialsPanel } from "@/components/project/credentials-panel";
import { WorkflowsPanel } from "@/components/project/workflows-panel";

const PROJECT_TABS = [
  { label: "Workflows", slug: "workflows" },
  { label: "Credentials", slug: "credentials" },
  { label: "Executions", slug: "executions" },
] as const;

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 364 : -364,
    opacity: 0,
    height: "auto",
    position: "initial",
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    height: "auto",
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 364 : -364,
    opacity: 0,
    position: "absolute",
    top: 0,
    width: "100%",
  }),
} as const;

const transition = {
  x: { type: "spring", stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 },
} as const;

type SectionProjectProps = {
  projectId: string | null;
};

export function SectionProject({ projectId }: SectionProjectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialSlug = () => {
    return searchParams.get("tab")?.toLowerCase() || PROJECT_TABS[0].slug;
  };

  const [activeIndex, setActiveIndex] = useState(
    Math.max(
      PROJECT_TABS.findIndex((tab) => tab.slug === initialSlug()),
      0,
    ),
  );
  const [direction, setDirection] = useState(1);

  const handleSetActiveIndex = (newIndex: number) => {
    const nextSlug = PROJECT_TABS[newIndex].slug;
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("tab", nextSlug);

    router.replace(`${pathname}?${currentParams.toString()}`, {
      scroll: false,
    });
    setDirection(newIndex > activeIndex ? 1 : -1);
    setActiveIndex(newIndex);
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex space-x-2">
        {PROJECT_TABS.map((tab, index) => (
          <button
            key={tab.slug}
            onClick={() => handleSetActiveIndex(index)}
            className={cn(
              "rounded-md px-3 py-1 text-sm font-medium",
              activeIndex === index
                ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden border-t border-zinc-200 dark:border-zinc-700 py-5">
        <TransitionPanel
          activeIndex={activeIndex}
          variants={variants}
          transition={transition}
          custom={direction}
        >
          <WorkflowsPanel key={PROJECT_TABS[0].slug} projectId={projectId} />
          <CredentialsPanel key={PROJECT_TABS[1].slug} projectId={projectId} />
          <ExecutionsPanel key={PROJECT_TABS[2].slug} projectId={projectId} />
        </TransitionPanel>
      </div>
    </div>
  );
}
