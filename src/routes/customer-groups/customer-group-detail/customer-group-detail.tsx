import { useLoaderData, useParams } from 'react-router-dom';

import { SingleColumnPageSkeleton } from '../../../components/common/skeleton';
import { SingleColumnPage } from '../../../components/layout/pages';
import { useDashboardExtension } from '../../../extensions';
import { useCustomerGroup } from '../../../hooks/api/customer-groups';
import { CustomerGroupCustomerSection } from './components/customer-group-customer-section';
import { CustomerGroupGeneralSection } from './components/customer-group-general-section';
import { CUSTOMER_GROUP_DETAIL_FIELDS } from './constants';
import { customerGroupLoader } from './loader';

export const CustomerGroupDetail = () => {
  const initialData = useLoaderData() as Awaited<ReturnType<typeof customerGroupLoader>>;

  const { id } = useParams();
  const { customer_group, isLoading, isError, error } = useCustomerGroup(
    id!,
    {
      fields: CUSTOMER_GROUP_DETAIL_FIELDS
    },
    { initialData }
  );

  const { getWidgets } = useDashboardExtension();

  if (isLoading || !customer_group) {
    return <SingleColumnPageSkeleton sections={2} />;
  }

  if (isError) {
    throw error;
  }

  return (
    <SingleColumnPage
      widgets={{
        before: getWidgets('customer_group.details.before'),
        after: getWidgets('customer_group.details.after')
      }}
      data={customer_group}
    >
      <CustomerGroupGeneralSection group={customer_group} />
      <CustomerGroupCustomerSection group={customer_group} />
    </SingleColumnPage>
  );
};
