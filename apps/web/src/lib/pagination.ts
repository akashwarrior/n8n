export type OrderByField = "createdAt" | "updatedAt" | "name";

export type PaginatedParams = {
  query?: string;
  limit: number;
  skip: number;
  orderBy: "asc" | "desc";
  orderByField: OrderByField;
};

export const defaultParams: Readonly<PaginatedParams> = {
  query: undefined,
  skip: 0,
  limit: 10,
  orderBy: "desc",
  orderByField: "createdAt",
};

export const buildPaginatedParams = (
  overrides?: Partial<PaginatedParams>,
): PaginatedParams => ({
  ...defaultParams,
  ...overrides,
});

const serializeParams = (
  params: Record<string, string | number | undefined>,
) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });

  return search;
};

export const keyBuilder = (
  index: number,
  endpoint: string,
  params: PaginatedParams = defaultParams,
  extraParams?: Record<string, string>,
) => {
  const mergedParams = buildPaginatedParams(params);
  const skip = index * mergedParams.limit;

  const search = serializeParams({
    ...mergedParams,
    ...extraParams,
    limit: mergedParams.limit + 1, // +1 to check if next page is available
    skip,
  });

  return `${endpoint}?${search.toString()}`;
};
