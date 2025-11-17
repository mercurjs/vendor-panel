import { Pencil } from '@medusajs/icons';
import { Container, Heading, Text } from '@medusajs/ui';

import { ActionMenu } from '../../../../../components/common/action-menu';
import { StoreVendor } from '../../../../../types/user';

export const CompanySection = ({ seller }: { seller: StoreVendor }) => {
  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Company</Heading>
          <Text
            size="small"
            className="text-pretty text-ui-fg-subtle"
          >
            Manage your company's details
          </Text>
        </div>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  icon: <Pencil />,
                  label: 'Edit',
                  to: 'edit-company'
                }
              ]
            }
          ]}
        />
      </div>
      <div className="grid grid-cols-2 px-6 py-4 text-ui-fg-subtle">
        <Text
          size="small"
          leading="compact"
          weight="plus"
        >
          Address
        </Text>
        <Text
          size="small"
          leading="compact"
        >
          {seller.address_line || '-'}
        </Text>
      </div>
      <div className="grid grid-cols-2 px-6 py-4 text-ui-fg-subtle">
        <Text
          size="small"
          leading="compact"
          weight="plus"
        >
          Postal Code
        </Text>
        <Text
          size="small"
          leading="compact"
        >
          {seller.postal_code || '-'}
        </Text>
      </div>
      <div className="grid grid-cols-2 px-6 py-4 text-ui-fg-subtle">
        <Text
          size="small"
          leading="compact"
          weight="plus"
        >
          City
        </Text>
        <Text
          size="small"
          leading="compact"
        >
          {seller.city || '-'}
        </Text>
      </div>
      <div className="grid grid-cols-2 px-6 py-4 text-ui-fg-subtle">
        <Text
          size="small"
          leading="compact"
          weight="plus"
        >
          Country
        </Text>
        <Text
          size="small"
          leading="compact"
        >
          {seller.country_code || '-'}
        </Text>
      </div>
      <div className="grid grid-cols-2 px-6 py-4 text-ui-fg-subtle">
        <Text
          size="small"
          leading="compact"
          weight="plus"
        >
          TaxID
        </Text>
        <Text
          size="small"
          leading="compact"
        >
          {seller.tax_id || '-'}
        </Text>
      </div>
    </Container>
  );
};
