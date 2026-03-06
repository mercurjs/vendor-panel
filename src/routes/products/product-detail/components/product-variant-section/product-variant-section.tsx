import { useCallback, useMemo } from 'react';

import { Buildings, Component, PencilSquare, Trash } from '@medusajs/icons';
import {
  Badge,
  Button,
  clx,
  Container,
  createDataTableColumnHelper,
  Heading,
  Tooltip,
  usePrompt
} from '@medusajs/ui';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { Action, ActionMenu } from '../../../../../components/common/action-menu';
import { Thumbnail } from '../../../../../components/common/thumbnail';
import { useDataTableDateColumns } from '../../../../../components/data-table/helpers/general/use-data-table-date-columns';
import { _DataTable } from '../../../../../components/table/data-table/data-table';
import { Filter } from '../../../../../components/table/data-table/data-table-filter';
import { useInventoryItemLevels } from '../../../../../hooks/api';
import { useDeleteVariantLazy, useProductVariants } from '../../../../../hooks/api/products';
import { useDataTable } from '../../../../../hooks/use-data-table';
import { useQueryParams } from '../../../../../hooks/use-query-params';
import {
  ExtendedAdminProduct,
  ExtendedAdminProductVariant,
  ExtendedAdminProductVariantListParams
} from '../../../../../types/products';
import { applyDateFilter } from '../../../../../utils/apply-date-filter';

type ProductVariantSectionProps = {
  product: ExtendedAdminProduct;
};

const PAGE_SIZE = 10;

export const ProductVariantSection = ({ product }: ProductVariantSectionProps) => {
  const { t } = useTranslation();

  const { searchParams, raw } = useVariantsTableQuery({ pageSize: PAGE_SIZE });

  const columns = useColumns(product);
  const filters = useFilters();

  const { variants, count, isLoading } = useProductVariants(product.id, {
    ...searchParams,
    fields: '*inventory_items'
  });

  const { table } = useDataTable({
    data: variants || [],
    columns: columns,
    count,
    enablePagination: true,
    pageSize: PAGE_SIZE,
    getRowId: row => row?.id || ''
  });

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">{t('products.variants.header')}</Heading>
        <div className="flex items-center justify-center gap-x-2">
          <ActionMenu
            groups={[
              {
                actions: [
                  {
                    label: t('products.variants.editStocksAndPrices.header'),
                    to: `edit-stocks-and-prices`,
                    icon: <PencilSquare />
                  }
                ]
              }
            ]}
            variant="primary"
          />
          <Button
            size="small"
            variant="secondary"
            asChild
          >
            <Link to="variants/create">{t('actions.create')}</Link>
          </Button>
        </div>
      </div>
      <_DataTable
        table={table}
        columns={columns}
        count={count}
        filters={filters}
        clearableSearch
        navigateTo={row => `variants/${row.original.id}`}
        pageSize={PAGE_SIZE}
        search
        pagination
        isLoading={isLoading}
        queryObject={raw}
        orderBy={[
          { key: 'created_at', label: t('fields.createdAt') },
          { key: 'updated_at', label: t('fields.updatedAt') }
        ]}
      />
    </Container>
  );
};

const columnHelper = createDataTableColumnHelper<ExtendedAdminProductVariant>();

const useColumns = (product: ExtendedAdminProduct) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutateAsync } = useDeleteVariantLazy(product.id);
  const prompt = usePrompt();

  const dateColumns = useDataTableDateColumns<ExtendedAdminProductVariant>();

  const handleDelete = useCallback(
    async (id: string, title: string) => {
      const res = await prompt({
        title: t('general.areYouSure'),
        description: t('products.deleteVariantWarning', {
          title
        }),
        confirmText: t('actions.delete'),
        cancelText: t('actions.cancel')
      });

      if (!res) {
        return;
      }

      await mutateAsync({ variantId: id });
    },
    [mutateAsync, prompt, t]
  );

  const optionColumns = useMemo(() => {
    if (!product?.options) {
      return [];
    }

    return product.options.map(option => {
      return columnHelper.display({
        id: option.id,
        header: option.title,
        cell: ({ row }) => {
          const variantOpt = row.original.options?.find(opt => opt.option_id === option.id);

          if (!variantOpt) {
            return <span className="text-ui-fg-muted">-</span>;
          }

          return (
            <div className="flex items-center">
              <Tooltip content={variantOpt.value}>
                <Badge
                  size="2xsmall"
                  title={variantOpt.value}
                  className="inline-flex min-w-[20px] max-w-[140px] items-center justify-center overflow-hidden truncate"
                >
                  {variantOpt.value}
                </Badge>
              </Tooltip>
            </div>
          );
        }
      });
    });
  }, [product]);

  const getActions = useCallback(
    (variant: ExtendedAdminProductVariant) => {
      const mainActions: Action[] = [
        {
          icon: <PencilSquare />,
          label: t('actions.edit'),
          onClick: () => {
            navigate(`edit-variant?variant_id=${variant.id}`);
          }
        }
      ];

      const secondaryActions: Action[] = [
        {
          icon: <Trash />,
          label: t('actions.delete'),
          onClick: () => handleDelete(variant.id, variant.title!)
        }
      ];

      const inventoryItemsCount = variant.inventory_items?.length || 0;

      switch (inventoryItemsCount) {
        case 0:
          break;
        case 1: {
          const inventoryItemLink = `/inventory/${variant.inventory_items![0].inventory_item_id}`;

          mainActions.push({
            label: t('products.variant.inventory.actions.inventoryItems'),
            onClick: () => {
              navigate(inventoryItemLink);
            },
            icon: <Buildings />
          });
          break;
        }
        default: {
          const ids = variant.inventory_items?.map(i => i.inventory?.id);

          if (!ids || ids.length === 0) {
            break;
          }

          const inventoryKitLink = `/inventory?${new URLSearchParams({
            id: ids.join(',')
          }).toString()}`;

          mainActions.push({
            label: t('products.variant.inventory.actions.inventoryKit'),
            onClick: () => {
              navigate(inventoryKitLink);
            },
            icon: <Component />
          });
        }
      }

      return [{ actions: mainActions }, { actions: secondaryActions }];
    },
    [handleDelete, navigate, t]
  );

  const getInventory = useCallback(
    (variant: ExtendedAdminProductVariant) => {
      const inventoryItems = variant.inventory_items?.map(i => i.inventory).filter(Boolean);

      const hasInventoryKit = inventoryItems ? inventoryItems.length > 1 : false;

      const locations: Record<string, boolean> = {};

      inventoryItems?.forEach(i => {
        i?.location_levels?.forEach(l => {
          locations[l.id] = true;
        });
      });

      const { location_levels } = useInventoryItemLevels(
        variant?.inventory_items?.[0]?.inventory_item_id!
      );

      const quantity =
        location_levels?.reduce((acc, curr) => acc + curr.available_quantity, 0) || 0;
      const locationCount =
        location_levels?.reduce((acc, curr) => acc + curr.stock_locations?.length, 0) || 0;

      const text = hasInventoryKit
        ? t('products.variant.tableItemAvailable', {
            availableCount: quantity
          })
        : t('products.variant.tableItem', {
            availableCount: quantity,
            locationCount,
            count: locationCount
          });

      return { text, hasInventoryKit, quantity };
    },
    [t]
  );

  return useMemo(() => {
    return [
      columnHelper.accessor('title', {
        header: t('fields.title'),
        enableSorting: true,
        sortAscLabel: t('general.ascending'),
        sortDescLabel: t('general.descending'),
        cell: ({ row }) => {
          return (
            <div className="flex h-full w-full max-w-[250px] items-center gap-x-3 overflow-hidden">
              <div className="w-fit flex-shrink-0">
                <Thumbnail src={row.original.thumbnail} />
              </div>
              <span
                title={row.original.title || undefined}
                className="truncate"
              >
                {row.original.title}
              </span>
            </div>
          );
        }
      }),
      columnHelper.accessor('sku', {
        header: t('fields.sku'),
        enableSorting: true,
        sortAscLabel: t('general.ascending'),
        sortDescLabel: t('general.descending')
      }),
      ...optionColumns,
      columnHelper.display({
        id: 'inventory',
        header: t('fields.inventory'),
        cell: ({ row }) => {
          const { text, hasInventoryKit, quantity } = getInventory(row.original);

          return (
            <Tooltip content={text}>
              <div className="flex h-full w-full items-center gap-2 overflow-hidden">
                {hasInventoryKit && <Component />}
                <span
                  className={clx('truncate', {
                    'text-ui-fg-error': !quantity
                  })}
                >
                  {text}
                </span>
              </div>
            </Tooltip>
          );
        },
        size: 500
      }),
      columnHelper.display({
        id: 'actions',
        cell: ctx => {
          const actions = getActions(ctx.row.original);

          return <ActionMenu groups={actions} />;
        }
      })
    ];
  }, [t, optionColumns, dateColumns, getActions, getInventory]);
};

const useFilters = () => {
  const { t } = useTranslation();

  const createdAtFilter: Filter = {
    key: 'created_at',
    label: t('fields.createdAt'),
    type: 'date'
  };

  const updatedAtFilter: Filter = {
    key: 'updated_at',
    label: t('fields.updatedAt'),
    type: 'date'
  };

  return useMemo(() => {
    return [createdAtFilter, updatedAtFilter];
  }, [t, createdAtFilter, updatedAtFilter]);
};

type UseVariantsTableQueryProps = {
  prefix?: string;
  pageSize?: number;
};

const useVariantsTableQuery = ({ pageSize = 10 }: UseVariantsTableQueryProps) => {
  const queryObject = useQueryParams([
    'q',
    'order',
    'offset',
    'allow_backorder',
    'manage_inventory',
    'created_at',
    'updated_at'
  ]);

  const { offset, order, q, allow_backorder, manage_inventory, created_at, updated_at } =
    queryObject;

  const searchParams: Record<string, unknown> = {
    limit: pageSize,
    offset: offset ? Number(offset) : 0,
    order,
    q,
    allow_backorder,
    manage_inventory
  };

  applyDateFilter('created_at', created_at, searchParams);
  applyDateFilter('updated_at', updated_at, searchParams);

  return { searchParams: searchParams as ExtendedAdminProductVariantListParams, raw: queryObject };
};
