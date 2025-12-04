"use client";

import useSWRInfinite from "swr/infinite";
import { useState } from "react";
import {
  buildPaginatedParams,
  keyBuilder,
  PaginatedParams,
} from "@/lib/pagination";

type UsePaginatedListProps = {
  endpoint: string;
  params?: Record<string, string>;
  initialParams?: Partial<PaginatedParams>;
};

export function usePaginatedList<T>({
  endpoint,
  params: extraParams,
  initialParams,
}: UsePaginatedListProps) {
  const [activePage, setActivePage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [params, setParams] = useState<PaginatedParams>(
    buildPaginatedParams(initialParams),
  );

  const { data, error, isValidating, mutate, setSize } = useSWRInfinite<T[]>(
    (index) => keyBuilder(index, endpoint, params, extraParams),
    async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const result = (await response.json()) as T[];

      if (result.length === params.limit + 1) {
        result.pop();
        setHasMore(true);
      } else {
        setHasMore(false);
      }

      return result;
    },
    {
      revalidateOnFocus: false,
    },
  );

  const loadMore = () => {
    if (hasMore) {
      setSize((size) => size + 1);
    }
  };

  return {
    items: data ?? [],
    validating: isValidating,
    error,
    params,
    activePage,
    setParams,
    mutate,
    setActivePage,
    hasMore,
    loadMore,
  };
}
