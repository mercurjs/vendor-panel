import { Buildings } from '@medusajs/icons';
import { useTranslation } from 'react-i18next';

import { ActionMenu } from '../../../../../components/common/action-menu';

export const InventoryActions = ({ item }: { item: string }) => {
  const { t } = useTranslation();

  return (
    <ActionMenu
      groups={[
        {
          actions: [
            {
              icon: <Buildings />,
              label: t('products.variant.inventory.navigateToItem'),
              to: `/inventory/${item}`
            }
          ]
        }
      ]}
    />
  );
};
