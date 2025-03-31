import { useParams } from 'react-router-dom';

import { usePriceList } from '../../../hooks/api/price-lists';
import { PriceListConfigurationSection } from './components/price-list-configuration-section';
import { PriceListGeneralSection } from './components/price-list-general-section';
import { PriceListProductSection } from './components/price-list-product-section';

import { TwoColumnPageSkeleton } from '../../../components/common/skeleton';
import { TwoColumnPage } from '../../../components/layout/pages';
import { useDashboardExtension } from '../../../extensions';

export const PriceListDetails = () => {
  const { id } = useParams();

  const { price_list, isLoading, isError, error } =
    usePriceList(id!, {
      fields: '*products'
    });

  const { getWidgets } = useDashboardExtension();

  const list = price_list[0];

  if (isLoading || !list) {
    return (
      <TwoColumnPageSkeleton 
        mainSections={2}
        sidebarSections={1}
        showJSON
      />
    );
  }

  if (isError) {
    throw error;
  }


  return (
    <TwoColumnPage
      widgets={{
        after: getWidgets('price_list.details.after'),
        before: getWidgets('price_list.details.before'),
        sideAfter: getWidgets(
          'price_list.details.side.after'
        ),
        sideBefore: getWidgets(
          'price_list.details.side.before'
        ),
      }}
      data={price_list}
    >
      <TwoColumnPage.Main>
        <PriceListGeneralSection priceList={list} />
        <PriceListProductSection priceList={list} />
      </TwoColumnPage.Main>
      <TwoColumnPage.Sidebar>
        <PriceListConfigurationSection priceList={list} />
      </TwoColumnPage.Sidebar>
    </TwoColumnPage>
  );
};
