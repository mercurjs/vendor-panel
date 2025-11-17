import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, toast } from '@medusajs/ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form } from '../../../../components/common/form';
import { RouteDrawer, useRouteModal } from '../../../../components/modals';
import { KeyboundForm } from '../../../../components/utilities/keybound-form';
import { useUpdateMe } from '../../../../hooks/api';
import { StoreVendor } from '../../../../types/user';

const EditStoreSchema = z.object({
  address_line: z.string().optional(),
  postal_code: z.string().optional(),
  city: z.string().optional(),
  country_code: z.string().optional(),
  tax_id: z.string().optional()
});

export const EditStoreCompanyForm = ({ seller }: { seller: StoreVendor }) => {
  const { handleSuccess } = useRouteModal();

  const form = useForm<z.infer<typeof EditStoreSchema>>({
    defaultValues: {
      address_line: seller.address_line || '',
      postal_code: seller.postal_code || '',
      city: seller.city || '',
      country_code: seller.country_code || '',
      tax_id: seller.tax_id || ''
    },
    resolver: zodResolver(EditStoreSchema)
  });

  const { mutateAsync, isPending } = useUpdateMe();

  const handleSubmit = form.handleSubmit(async values => {
    await mutateAsync(
      {
        ...values
      },
      {
        onSuccess: () => {
          toast.success('Store updated');
          handleSuccess();
        },
        onError: error => {
          toast.error(error.message);
        }
      }
    );
  });

  return (
    <RouteDrawer.Form form={form}>
      <KeyboundForm
        onSubmit={handleSubmit}
        className="flex h-full flex-col"
      >
        <RouteDrawer.Body>
          <div className="flex flex-col gap-y-8">
            <Form.Field
              name="address_line"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Address</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.ErrorMessage />
                </Form.Item>
              )}
            />
            <Form.Field
              name="postal_code"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Postal Code</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.ErrorMessage />
                </Form.Item>
              )}
            />
            <Form.Field
              name="city"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>City</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.ErrorMessage />
                </Form.Item>
              )}
            />
            <Form.Field
              name="country_code"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Country</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.ErrorMessage />
                </Form.Item>
              )}
            />
            <Form.Field
              name="tax_id"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Tax ID</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.ErrorMessage />
                </Form.Item>
              )}
            />
          </div>
        </RouteDrawer.Body>
        <RouteDrawer.Footer>
          <RouteDrawer.Close asChild>
            <Button
              size="small"
              variant="secondary"
            >
              Cancel
            </Button>
          </RouteDrawer.Close>
          <Button
            type="submit"
            size="small"
            isLoading={isPending}
          >
            Save
          </Button>
        </RouteDrawer.Footer>
      </KeyboundForm>
    </RouteDrawer.Form>
  );
};
