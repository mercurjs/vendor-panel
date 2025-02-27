import {
  Badge,
  Button,
  Container,
  Heading,
  Text,
} from '@medusajs/ui';
import { SingleColumnPage } from '../../../components/layout/pages';
import { useDashboardExtension } from '../../../extensions';
import { useRequests } from '../../../hooks/api';
import { TriangleRightMini } from '@medusajs/icons';
import { Link } from 'react-router-dom';

export const Requests = () => {
  const { getWidgets } = useDashboardExtension();

  const { requests, isError, error } = useRequests();

  const categoryRequests =
    requests?.filter(
      ({ type }: { type: string }) =>
        type === 'product_category'
    ) || [];
  const collectionRequests =
    requests?.filter(
      ({ type }: { type: string }) =>
        type === 'product_collection'
    ) || [];
  const reviewRequests =
    requests?.filter(
      ({ type }: { type: string }) =>
        type === 'review_remove'
    ) || [];
  const ordersRequests =
    requests?.filter(
      ({ type }: { type: string }) => type === 'orders'
    ) || [];

  const categoryRequestCount = categoryRequests.length;
  const collectionRequestCount = collectionRequests.length;
  const reviewRequestCount = reviewRequests.length;
  const ordersRequestsCount = ordersRequests.length;

  if (isError) {
    throw error;
  }

  return (
    <SingleColumnPage
      widgets={{
        after: getWidgets('customer.list.after'),
        before: getWidgets('customer.list.before'),
      }}
    >
      <Container className='p-0'>
        <div className='flex items-center justify-between px-6 py-4'>
          <div>
            <Heading>Requests</Heading>
            <Text
              className='text-ui-fg-subtle'
              size='small'
            >
              Check the status of your requests and add new
              ones
            </Text>
          </div>
        </div>
        <div className='px-6 py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4'>
          <Link to='/requests/collections'>
            <Button className='w-full justify-between py-4'>
              <div className='flex gap-4 items-center'>
                <Badge>{collectionRequestCount}</Badge>
                Collections requests
              </div>
              <TriangleRightMini />
            </Button>
          </Link>
          <Link to='/requests/categories'>
            <Button className='w-full justify-between py-4'>
              <div className='flex gap-4 items-center'>
                <Badge>{categoryRequestCount}</Badge>
                Categories requests
              </div>
              <TriangleRightMini />
            </Button>
          </Link>
          <Link to='/requests/reviews'>
            <Button className='w-full justify-between py-4'>
              <div className='flex gap-4 items-center'>
                <Badge>{reviewRequestCount}</Badge>
                Reviews requests
              </div>
              <TriangleRightMini />
            </Button>
          </Link>
          <Link to='/requests/orders'>
            <Button className='w-full justify-between py-4'>
              <div className='flex gap-4 items-center'>
                <Badge>{ordersRequestsCount}</Badge>
                Orders requests
              </div>
              <TriangleRightMini />
            </Button>
          </Link>
        </div>
      </Container>
    </SingleColumnPage>
  );
};
