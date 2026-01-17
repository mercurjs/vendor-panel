import { Heading } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';

import { RouteDrawer } from '../../../components/modals';

export const ProductAddAttribute = () => {
  const { t } = useTranslation();

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <RouteDrawer.Title asChild>
          <Heading>{t('actions.add')} Attrbiute</Heading>
        </RouteDrawer.Title>
      </RouteDrawer.Header>
    </RouteDrawer>
  );
};
