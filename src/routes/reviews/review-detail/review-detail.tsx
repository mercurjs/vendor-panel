import { useLoaderData, useParams } from 'react-router-dom';
import { TwoColumnPage } from '../../../components/layout/pages';
import { useDashboardExtension } from '../../../extensions';
import { useReview } from '../../../hooks/api/review';
import { ReviewGeneralSection } from './components/review-general-section';
import { reviewLoader } from './loader';
import { TwoColumnPageSkeleton } from '../../../components/common/skeleton';

export const ReviewDetail = () => {
  const initialData = useLoaderData() as Awaited<
    ReturnType<typeof reviewLoader>
  >;

  const { id } = useParams();
  const { review, isLoading, isError, error } = useReview(
    id!,
    { fields: '*' },
    { initialData }
  );

  const { getWidgets } = useDashboardExtension();
  if (isLoading || !review) {
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
        sideAfter: getWidgets(
          'campaign.details.side.after'
        ),
        sideBefore: getWidgets(
          'campaign.details.side.before'
        ),
      }}
      data={review}
    >
      <TwoColumnPage.Main>
        <ReviewGeneralSection review={review} />
      </TwoColumnPage.Main>
      <TwoColumnPage.Sidebar>Sidebar</TwoColumnPage.Sidebar>
    </TwoColumnPage>
  );
};
