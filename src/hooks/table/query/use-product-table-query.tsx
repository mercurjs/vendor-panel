import { HttpTypes } from '@medusajs/types';

import { useQueryParams } from '../../use-query-params';

type UseProductTableQueryProps = {
  prefix?: string;
  pageSize?: number;
};

const DEFAULT_FIELDS = 'id,title,handle,status,discountable,*collection,*sales_channels,variants.id,thumbnail';

export const useProductTableQuery = ({ prefix, pageSize = 20 }: UseProductTableQueryProps) => {
  const queryObject = useQueryParams(
    [
      'offset',
      'order',
      'q',
      'created_at',
      'updated_at',
      'sales_channel_id',
      'category_id',
      'collection_id',
      'is_giftcard',
      'tag_id',
      'type_id',
      'status',
      'id'
    ],
    prefix
  );

  const {
    offset,
    sales_channel_id,
    created_at,
    updated_at,
    category_id,
    collection_id,
    tag_id,
    type_id,
    is_giftcard,
    status,
    order,
    q
  } = queryObject;

  const searchParams: HttpTypes.AdminProductListParams & {
    tag_id?: string | string[];
    categoryId?: string | string[];
    collectionId?: string | string[];
    typeId?: string | string[];
    status?: string | string[];
  } = {
    limit: pageSize,
    offset: offset ? Number(offset) : 0,
    sales_channel_id: sales_channel_id?.split(','),
    created_at: undefined,
    updated_at: undefined,
    category_id: category_id?.split(','),
    collection_id: collection_id?.split(','),
    is_giftcard: is_giftcard ? is_giftcard === 'true' : undefined,
    order: order,
    tag_id: tag_id ? tag_id.split(',') : undefined,
    type_id: type_id?.split(','),
    status: status?.split(',') as HttpTypes.AdminProductStatus[],
    q,
    fields: DEFAULT_FIELDS
  };

  /**
   * Flatten date filters so they use bracket notation:
   * created_at[$gte]=... instead of created_at={"$gte":"..."}
   * This matches the backend expectation and the admin app payload.
   */
  const applyDateFilter = (key: 'created_at' | 'updated_at', raw: string | undefined) => {
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        Object.entries(parsed).forEach(([op, value]) => {
          if (value) {
            (searchParams as Record<string, any>)[`${key}[${op}]`] = value;
          }
        });
      }
    } catch {
      // Ignore malformed JSON and leave filter unset
    }
  };

  applyDateFilter('created_at', created_at);
  applyDateFilter('updated_at', updated_at);

  return {
    searchParams,
    raw: queryObject
  };
};
