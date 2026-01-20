import { Button, Heading, toast } from '@medusajs/ui';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { RouteDrawer } from '../../../components/modals';
import { KeyboundForm } from '../../../components/utilities/keybound-form';
import { useAddProductAttribute } from '../../../hooks/api/products';
import { UserCreatedOptionsList } from '../product-create/components/product-create-attributes-form/user-created-options-list';

type AddAttributeFormValues = {
  options: Array<{
    title: string;
    values: string[];
    metadata?: Record<string, unknown>;
    useForVariants?: boolean;
  }>;
};

export const ProductAddAttribute = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const form = useForm<AddAttributeFormValues>({
    defaultValues: {
      options: [
        {
          title: '',
          values: [],
          metadata: { author: 'vendor' },
          useForVariants: true
        }
      ]
    }
  });

  const options = useFieldArray({
    control: form.control,
    name: 'options'
  });

  const { mutateAsync, isPending } = useAddProductAttribute(id!);

  const handleSubmit = form.handleSubmit(async (data) => {
    const option = data.options?.[0];

    const name = option?.title?.trim();
    const values = (option?.values ?? []).map(v => v.trim()).filter(Boolean);
    const use_for_variations = option?.useForVariants === true;

    if (!name) {
      toast.error(t('products.fields.options.optionTitlePlaceholder'));
      return;
    }

    if (!values.length) {
      toast.error(t('products.fields.options.variantionsPlaceholder'));
      return;
    }

    await mutateAsync(
      {
        name,
        values,
        use_for_variations,
        ui_component: 'multivalue',
      },
      {
        onSuccess: () => {
          toast.success(t('actions.save'));
          navigate(`/products/${id}`, {
            replace: true,
            state: { isSubmitSuccessful: true },
          });
        },
        onError: (err) => {
          toast.error(err.message);
        }
      }
    );
  });

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <div className="flex items-center justify-between">
          <RouteDrawer.Title asChild>
            <Heading>{t('actions.add')} Attrbiute</Heading>
          </RouteDrawer.Title>
        </div>
      </RouteDrawer.Header>
      <RouteDrawer.Form form={form}>
        <KeyboundForm
          onSubmit={handleSubmit}
          className="flex h-full flex-col"
        >
          <RouteDrawer.Body className="flex flex-col gap-y-4">
            <UserCreatedOptionsList
              form={form as any}
              options={options as any}
              allowRemove={false}
            />
          </RouteDrawer.Body>
          <RouteDrawer.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <RouteDrawer.Close asChild>
                <Button
                  size="small"
                  variant="secondary"
                  type="button"
                  disabled={isPending}
                >
                  {t('actions.cancel')}
                </Button>
              </RouteDrawer.Close>
              <Button
                size="small"
                type="submit"
                isLoading={isPending}
              >
                {t('actions.create')}
              </Button>
            </div>
          </RouteDrawer.Footer>
        </KeyboundForm>
      </RouteDrawer.Form>
    </RouteDrawer>
  );
};
