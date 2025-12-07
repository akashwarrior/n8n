import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  IconDotsVertical,
  IconEdit,
  IconPencilShare,
  IconTrash,
} from "@tabler/icons-react";

type ItemCardProps = {
  title: string;
  status?: React.ReactNode;
  projectName: string;
  description: string[];
  openProject: (e: React.MouseEvent<HTMLSpanElement>) => void;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
};

export function ItemCard({
  title,
  status,
  projectName,
  description,
  openProject,
  onOpen,
  onRename,
  onDelete,
}: ItemCardProps) {
  return (
    <Card className="p-4 sm:p-5">
      <CardContent className="flex p-0 gap-4 items-center">
        <div className="flex flex-col sm:flex-row w-full gap-3 items-start sm:items-center justify-between overflow-hidden">
          <div className="space-y-1.5 flex-1 overflow-hidden">
            <CardTitle>{title}</CardTitle>
            <CardDescription className="text-xs truncate">
              {description.join(" | ")}
            </CardDescription>
          </div>

          <Badge onClick={openProject} className="rounded-md cursor-pointer">
            {projectName}
          </Badge>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between items-end sm:items-center gap-4 sm:gap-3">
          {status}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <IconDotsVertical />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-24 rounded-lg">
              <DropdownMenuItem onClick={onOpen}>
                <IconPencilShare />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onRename}>
                <IconEdit />
                <span>Rename</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                <IconTrash />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
