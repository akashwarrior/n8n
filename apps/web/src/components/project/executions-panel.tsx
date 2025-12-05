"use client";

import { intlFormat } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import type { WorkflowExecutions } from "@n8n/db";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconDotsVertical,
  IconExclamationCircle,
  IconLoader,
  IconProgress,
  IconProgressAlert,
} from "@tabler/icons-react";

const STATUS_CONFIG = {
  SUCCESS: {
    Icon: IconCircleCheck,
    className: "text-green-500 dark:text-green-400",
  },
  RUNNING: { Icon: IconLoader, className: "animate-spin" },
  PENDING: { Icon: IconProgress, className: "" },
  CANCELLED: { Icon: IconProgressAlert, className: "" },
  ERROR: {
    Icon: IconExclamationCircle,
    className: "text-red-500 dark:text-red-400",
  },
} as const;

const formatDate = (date: Date) =>
  intlFormat(
    date,
    {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      second: "2-digit",
    },
    { locale: "en-US" },
  );

const StatusBadge = ({ status }: { status: keyof typeof STATUS_CONFIG }) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.RUNNING;
  const { Icon, className } = config;
  return (
    <Badge variant="outline" className="text-muted-foreground px-1.5">
      <Icon className={className} />
      {status}
    </Badge>
  );
};

const RowActions = ({ onDelete }: { onDelete: () => void }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
        size="icon"
      >
        <IconDotsVertical />
        <span className="sr-only">Open menu</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-32">
      <DropdownMenuItem variant="destructive" onClick={onDelete}>
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50] as const;

type ExecutionRowType = Omit<WorkflowExecutions, "userId"> & {
  workflowName: string;
};

export function ExecutionsPanel({ projectId }: { projectId: string | null }) {
  const {
    items: executions,
    params,
    setParams,
    activePage,
    setActivePage,
  } = usePaginatedList<ExecutionRowType>({
    endpoint: "/api/executions",
    ...(projectId && { params: { projectId } }),
  });

  const handleDelete = (id: string) => {
    console.log(`Delete execution with id: ${id}`);
  };

  return (
    <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              <TableHead>Workflow</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Exec. ID</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {executions[activePage - 1]?.length > 0 ? (
              executions[activePage - 1]?.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.workflowName}</TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell>{formatDate(row.startedAt)}</TableCell>
                  <TableCell>{row.duration} ms</TableCell>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>
                    <RowActions onDelete={() => handleDelete(row.id)} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No execution results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end px-4">
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={params.limit?.toString()}
              onValueChange={(value) =>
                setParams({ ...params, limit: Number(value) })
              }
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue placeholder={params.limit} />
              </SelectTrigger>
              <SelectContent side="top">
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {Math.floor(params.skip / params.limit) + 1} of{" "}
            {Math.ceil(executions.length / params.limit)}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() =>
                setParams({ ...params, skip: params.skip - params.limit })
              }
              disabled={params.skip === 0}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() =>
                setParams({ ...params, skip: params.skip + params.limit })
              }
              disabled={params.skip + params.limit >= executions.length}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
