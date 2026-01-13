import { useEffect, useRef, useState } from 'react';

import { DescendingSorting } from '@medusajs/icons';
import { DropdownMenu, IconButton } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

export type DataTableOrderByKey<TData> = {
  key: keyof TData;
  label: string;
};

type DataTableOrderByProps<TData> = {
  keys: DataTableOrderByKey<TData>[];
  prefix?: string;
};

enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

type SortState = {
  key?: string;
  dir: SortDirection;
};

const initState = (
  params: URLSearchParams,
  prefix?: string,
  keys?: DataTableOrderByKey<any>[]
): SortState => {
  const param = prefix ? `${prefix}_order` : 'order';
  const sortParam = params.get(param);

  if (!sortParam) {
    // Use first available key as default if keys are provided
    const defaultKey = keys && keys.length > 0 ? String(keys[0].key) : undefined;
    return {
      key: defaultKey,
      dir: SortDirection.ASC
    };
  }

  const dir = sortParam.startsWith('-') ? SortDirection.DESC : SortDirection.ASC;
  const key = sortParam.replace('-', '');

  return {
    key,
    dir
  };
};

export const DataTableOrderBy = <TData,>({ keys, prefix }: DataTableOrderByProps<TData>) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const param = prefix ? `${prefix}_order` : 'order';
  const [state, setState] = useState<{
    key?: string;
    dir: SortDirection;
  }>(initState(searchParams, prefix, keys));
  const { t } = useTranslation();
  const hasInitialized = useRef(false);

  // Set default order parameter in URL if no order is set and keys are available
  useEffect(() => {
    if (hasInitialized.current) return;
    if (!keys || keys.length === 0) return;

    const sortParam = searchParams.get(param);
    // If no order param exists, set the first available key as default
    if (!sortParam) {
      const defaultKey = String(keys[0].key);
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set(param, defaultKey);
        return newParams;
      });
      setState({
        key: defaultKey,
        dir: SortDirection.ASC
      });
      hasInitialized.current = true;
    } else {
      hasInitialized.current = true;
    }
  }, [keys, param, searchParams, setSearchParams]);

  const handleDirChange = (dir: string) => {
    setState(prev => ({
      ...prev,
      dir: dir as SortDirection
    }));
    updateOrderParam({
      key: state.key,
      dir: dir as SortDirection
    });
  };

  const handleKeyChange = (value: string) => {
    setState(prev => ({
      ...prev,
      key: value
    }));

    updateOrderParam({
      key: value,
      dir: state.dir
    });
  };

  const updateOrderParam = (state: SortState) => {
    if (!state.key) {
      setSearchParams(prev => {
        prev.delete(param);
        return prev;
      });

      return;
    }

    const orderParam = state.dir === SortDirection.ASC ? state.key : `-${state.key}`;
    setSearchParams(prev => {
      prev.set(param, orderParam);
      return prev;
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <IconButton size="small">
          <DescendingSorting />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        className="z-[1]"
        align="end"
      >
        <DropdownMenu.RadioGroup
          value={state.key}
          onValueChange={handleKeyChange}
        >
          {keys.map(key => {
            const stringKey = String(key.key);

            return (
              <DropdownMenu.RadioItem
                key={stringKey}
                value={stringKey}
                onSelect={event => event.preventDefault()}
              >
                {key.label}
              </DropdownMenu.RadioItem>
            );
          })}
        </DropdownMenu.RadioGroup>
        <DropdownMenu.Separator />
        <DropdownMenu.RadioGroup
          value={state.dir}
          onValueChange={handleDirChange}
        >
          <DropdownMenu.RadioItem
            className="flex items-center justify-between"
            value="asc"
            onSelect={event => event.preventDefault()}
          >
            {t('general.ascending')}
            <DropdownMenu.Label>1 - 30</DropdownMenu.Label>
          </DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem
            className="flex items-center justify-between"
            value="desc"
            onSelect={event => event.preventDefault()}
          >
            {t('general.descending')}
            <DropdownMenu.Label>30 - 1</DropdownMenu.Label>
          </DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
