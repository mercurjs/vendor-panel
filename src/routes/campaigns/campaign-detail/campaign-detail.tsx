import { useLoaderData, useParams } from 'react-router-dom';

import { TwoColumnPageSkeleton } from '../../../components/common/skeleton';
import { TwoColumnPage } from '../../../components/layout/pages';
import { useDashboardExtension } from '../../../extensions';
import { useCampaign } from '../../../hooks/api/campaigns';
import { usePromotionTableQuery } from '../../../hooks/table/query/use-promotion-table-query';
import { CampaignBudget } from './components/campaign-budget';
import { CampaignConfigurationSection } from './components/campaign-configuration-section';
import { CampaignGeneralSection } from './components/campaign-general-section';
import { CampaignPromotionSection } from './components/campaign-promotion-section';
import { CampaignSpend } from './components/campaign-spend';
import { CAMPAIGN_DETAIL_FIELDS } from './constants';
import { campaignLoader } from './loader';

export const CampaignDetail = () => {
  const initialData = useLoaderData() as Awaited<ReturnType<typeof campaignLoader>>;

  const { id } = useParams();
  const { searchParams } = usePromotionTableQuery({});
  const { campaign, isLoading, isError, error } = useCampaign(
    id!,
    { ...searchParams, fields: CAMPAIGN_DETAIL_FIELDS },
    { 
      placeholderData: initialData,
    }
  );

  const { getWidgets } = useDashboardExtension();

  if (isLoading || !campaign) {
    return (
      <TwoColumnPageSkeleton
        mainSections={2}
        sidebarSections={3}
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
      data={campaign}
    >
      <TwoColumnPage.Main>
        <CampaignGeneralSection campaign={campaign} />
        <CampaignPromotionSection campaign={campaign} />
      </TwoColumnPage.Main>
      <TwoColumnPage.Sidebar>
        <CampaignConfigurationSection campaign={campaign} />
        <CampaignSpend campaign={campaign} />
        <CampaignBudget campaign={campaign} />
      </TwoColumnPage.Sidebar>
    </TwoColumnPage>
  );
};
