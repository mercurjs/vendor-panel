import { useLoaderData, useParams } from 'react-router-dom';

import { TwoColumnPageSkeleton } from '../../../components/common/skeleton';
import { TwoColumnPage } from '../../../components/layout/pages';
import { useDashboardExtension } from '../../../extensions';
import { useRequest } from '../../../hooks/api';
import { ReviewGeneralSection } from './components/review-general-section';
import { requestLoader } from './loader';

export const RequestDetail = () => {
  const initialData = useLoaderData() as Awaited<ReturnType<typeof requestLoader>>;

  const { id } = useParams();
  const { request, isLoading, isError, error } = useRequest(
    id!,
    { fields: '*' },
    { initialData }
  ) as any;

  const { getWidgets } = useDashboardExtension();
  if (isLoading || !request) {
    return (
      <TwoColumnPageSkeleton
        mainSections={2}
        sidebarSections={3}
        showJSON
        showMetadata
      />
    );
  }

  if (isError) {
    throw error;
  }

  return (
    <TwoColumnPage
      widgets={{
        after: getWidgets('campaign.details.after'),
        before: getWidgets('campaign.details.before'),
        sideAfter: getWidgets('campaign.details.side.after'),
        sideBefore: getWidgets('campaign.details.side.before')
      }}
      hasOutlet
      showJSON
      showMetadata
      data={request}
    >
      <TwoColumnPage.Main>
        <ReviewGeneralSection />
      </TwoColumnPage.Main>
      <TwoColumnPage.Sidebar>Sidebar</TwoColumnPage.Sidebar>
    </TwoColumnPage>
  );
};
