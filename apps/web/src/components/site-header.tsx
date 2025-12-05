"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { ChevronDownIcon } from "lucide-react";
import { CreateOptionsDropdown } from "./create-options-dropdown";
import { useTheme } from "next-themes";
import { IconMoonStars, IconSunHigh } from "@tabler/icons-react";

type SiteHeaderProps = {
  title: string;
  description: string;
};

export function SiteHeader({ title, description }: SiteHeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex items-center justify-between gap-5 transition-[width,height] ease-linear w-full">
      <div className="overflow-hidden space-y-1.5">
        <h1 className="text-xl sm:text-3xl">{title}</h1>
        <p className="text-muted-foreground text-sm sm:text-base line-clamp-2">
          {description}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <ButtonGroup orientation="horizontal">
          <CreateOptionsDropdown
            createWorkflow={
              <Button size="sm" className=" text-xs">
                Create Workflow
              </Button>
            }
          >
            <Button size="icon-sm">
              <ChevronDownIcon />
            </Button>
          </CreateOptionsDropdown>
        </ButtonGroup>
        <Button
          size="icon-sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <IconSunHigh className="animate-in fade-in duration-100 absolute dark:hidden" />
          <IconMoonStars className="animate-out fade-out duration-100 absolute hidden dark:block" />
        </Button>
      </div>
    </header>
  );
}
