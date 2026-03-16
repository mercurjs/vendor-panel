import { useQueryParams } from '../../../../hooks/use-query-params';

export const useCustomerGroupsTableQuery = ({
  pageSize = 20,
  prefix
}: {
  pageSize?: number;
  prefix?: string;
}) => {
  const raw = useQueryParams(['q', 'offset', 'order', 'created_at', 'updated_at'], prefix);

  const searchParams = {
    q: raw.q,
    limit: pageSize,
    offset: raw.offset ? Number(raw.offset) : 0,
    order: raw.order
  };

  return {
    raw,
    searchParams
  };
};
