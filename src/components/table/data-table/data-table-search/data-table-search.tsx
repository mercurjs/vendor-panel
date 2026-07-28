import { ChangeEvent, useCallback, useEffect } from 'react';

import { XMarkMini } from '@medusajs/icons';
import { Button, Input } from '@medusajs/ui';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useSelectedParams } from '../hooks';

type DataTableSearchProps = {
  placeholder?: string;
  prefix?: string;
  autofocus?: boolean;
  clearable?: boolean;
};

export const DataTableSearch = ({
  placeholder,
  prefix,
  autofocus,
  clearable
}: DataTableSearchProps) => {
  const { t } = useTranslation();
  const placeholderText = placeholder || t('general.search');
  const selectedParams = useSelectedParams({
    param: 'q',
    prefix,
    multiple: false
  });

  const query = selectedParams.get()?.[0];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnChange = useCallback(
    debounce((e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      if (!value) {
        selectedParams.delete();
      } else {
        selectedParams.add(value);
      }
    }, 500),
    [selectedParams]
  );

  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  return (
    <div className="relative">
      <Input
        autoComplete="off"
        name="q"
        type="search"
        size="small"
        key={query}
        autoFocus={autofocus}
        defaultValue={query || undefined}
        onChange={debouncedOnChange}
        placeholder={placeholderText}
      />
      {!!query && clearable && (
        <Button
          size="small"
          variant="transparent"
          className="absolute right-0 top-1/2 -translate-y-1/2"
          onClick={() =>
            debouncedOnChange({ target: { value: '' } } as ChangeEvent<HTMLInputElement>)
          }
        >
          <XMarkMini className="text-ui-fg-muted" />
        </Button>
      )}
    </div>
  );
};
