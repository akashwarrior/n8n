"use client";

import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import { Card, CardContent } from "@/components/ui/card";
import { RenameDialog, type RenameState } from "@/components/rename-dialog";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { PaginatedParams } from "@/lib/pagination";
import { IconFilter, IconSearch } from "@tabler/icons-react";

type SortOptionKey = "createdAtDesc" | "updatedAtDesc" | "nameAsc" | "nameDesc";

const SORT_OPTIONS: Record<
  SortOptionKey,
  {
    label: string;
    orderByField: PaginatedParams["orderByField"];
    orderBy: PaginatedParams["orderBy"];
  }
> = {
  createdAtDesc: {
    label: "Sort by last created",
    orderByField: "createdAt",
    orderBy: "desc",
  },
  updatedAtDesc: {
    label: "Sort by last updated",
    orderByField: "updatedAt",
    orderBy: "desc",
  },
  nameAsc: {
    label: "Sort by name (A-Z)",
    orderByField: "name",
    orderBy: "asc",
  },
  nameDesc: {
    label: "Sort by name (Z-A)",
    orderByField: "name",
    orderBy: "desc",
  },
};

type FilterBarProps = {
  params: PaginatedParams;
  setParams: Dispatch<SetStateAction<PaginatedParams>>;
};

function FilterBar({ params, setParams }: FilterBarProps) {
  const [searchTerm, setSearchTerm] = useState(params.query ?? "");

  useEffect(() => {
    setSearchTerm(params.query ?? "");
  }, [params.query]);

  useEffect(() => {
    const debounceId = window.setTimeout(() => {
      setParams((prev) => ({
        ...prev,
        query: searchTerm || undefined,
        skip: 0,
      }));
    }, 300);

    return () => window.clearTimeout(debounceId);
  }, [searchTerm, setParams]);

  const handleSortChange = (value: SortOptionKey) => {
    const sort = SORT_OPTIONS[value];
    if (!sort) return;

    setParams((prev) => ({
      ...prev,
      orderByField: sort.orderByField,
      orderBy: sort.orderBy,
      skip: 0,
    }));
  };

  const selectedSortKey = useMemo(
    () =>
      (Object.entries(SORT_OPTIONS).find(
        ([, option]) =>
          option.orderByField === params.orderByField &&
          option.orderBy === params.orderBy,
      )?.[0] as SortOptionKey | undefined) ?? "createdAtDesc",
    [params.orderBy, params.orderByField],
  );

  return (
    <div className="flex flex-col sm:flex-row max-w-xl gap-2 ml-auto px-1">
      <InputGroup>
        <InputGroupInput
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search..."
        />
        <InputGroupAddon>
          <IconSearch />
        </InputGroupAddon>
      </InputGroup>

      <Select
        value={selectedSortKey}
        onValueChange={(value) => handleSortChange(value as SortOptionKey)}
      >
        <SelectTrigger className="w-full sm:min-w-[180px] sm:w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SORT_OPTIONS).map(([key, option]) => (
            <SelectItem key={key} value={key}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" size="icon" aria-label="Filter">
        <IconFilter />
      </Button>
    </div>
  );
}

type ProjectWrapperProps = {
  title: string;
  children: ReactNode;
  pages: number;
  activePage: number;
  params: PaginatedParams;
  renameState: RenameState | null;
  emptyMessage: string;
  isLoading: boolean;
  isEmpty: boolean;
  setParams: Dispatch<SetStateAction<PaginatedParams>>;
  setActivePage: Dispatch<SetStateAction<number>>;
  setRenameState: Dispatch<SetStateAction<RenameState | null>>;
  onRename?: (data: RenameState) => Promise<unknown>;
  errorMessage?: string;
};

const PLACEHOLDER_ITEMS = Array.from({ length: 5 });

export function ProjectWrapper({
  title,
  children,
  pages,
  activePage,
  params,
  renameState,
  emptyMessage,
  isLoading,
  isEmpty,
  setParams,
  setActivePage,
  setRenameState,
  onRename,
  errorMessage,
}: ProjectWrapperProps) {
  const showPagination = pages > 1;

  return (
    <section className="space-y-4">
      <FilterBar params={params} setParams={setParams} />

      {errorMessage && (
        <Card>
          <CardContent className="p-4 text-sm text-destructive">
            {errorMessage}
          </CardContent>
        </Card>
      )}

      {!errorMessage && !isLoading && isEmpty && (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            {emptyMessage}
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {children}

        {isLoading && (
          <div className="flex flex-col gap-2">
            {PLACEHOLDER_ITEMS.map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        )}
      </div>

      {onRename && (
        <RenameDialog
          title={title}
          renameState={renameState}
          onRename={onRename}
          setIsOpen={(open) => !open && setRenameState(null)}
        />
      )}

      {showPagination && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                size="default"
                onClick={() =>
                  activePage !== 1 && setActivePage(activePage - 1)
                }
              />
            </PaginationItem>
            {Array.from({ length: pages }).map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  size="default"
                  isActive={activePage === index + 1}
                  onClick={() => setActivePage(index + 1)}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                size="default"
                onClick={() =>
                  activePage !== pages && setActivePage(activePage + 1)
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </section>
  );
}
