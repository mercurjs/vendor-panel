import { Button, Heading } from '@medusajs/ui';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { RouteDrawer } from '../../../components/modals';
import { KeyboundForm } from '../../../components/utilities/keybound-form';
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
  useParams();
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

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
            />
          </RouteDrawer.Body>
          <RouteDrawer.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <RouteDrawer.Close asChild>
                <Button
                  size="small"
                  variant="secondary"
                  type="button"
                >
                  {t('actions.cancel')}
                </Button>
              </RouteDrawer.Close>
              <Button
                size="small"
                type="submit"
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
