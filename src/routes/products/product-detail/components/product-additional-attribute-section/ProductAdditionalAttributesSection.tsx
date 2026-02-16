import { AdjustmentsDone, PencilSquare, Plus, SquareTwoStack, Trash } from '@medusajs/icons';
import { Badge, Container, Heading, Text, toast, usePrompt } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';

import { ActionMenu } from '../../../../../components/common/action-menu';
import { SectionRow } from '../../../../../components/common/section';
import { useDeleteProductOption, useRemoveProductAttribute } from '../../../../../hooks/api/products';
import {
  ExtendedAdminProduct,
  ExtendedAdminProductOption,
  ProductInformationalAttribute,
  ProductInformationalAttributeValue,
} from '../../../../../types/products';

type ProductAttributeSectionProps = {
  product: ExtendedAdminProduct;
};

const OptionRowActions = ({
  productId,
  option,
}: {
  productId: string;
  option: ExtendedAdminProductOption;
}) => {
  const { t } = useTranslation();
  const prompt = usePrompt();
  const { mutateAsync, isPending } = useDeleteProductOption(productId, option.id);

  const canDelete = option.metadata?.author !== 'admin';

  const handleDelete = async () => {
    const res = await prompt({
      title: t('general.areYouSure'),
      description: t('products.options.deleteWarning', {
        title: option.title
      }),
      confirmText: t('actions.delete'),
      cancelText: t('actions.cancel')
    });

    if (!res) {
      return;
    }

    await mutateAsync(undefined, {
      onError: (err) => {
        toast.error(err.message);
      }
    });
  };

  return (
    <ActionMenu
      groups={[
        {
          actions: [
            {
              icon: <PencilSquare />,
              label: t('actions.edit'),
              to: `options/${option.id}/edit`,
            },
          ]
        },
        ...(canDelete
          ? [
              {
                actions: [
                  {
                    icon: <Trash />,
                    label: t('actions.delete'),
                    disabled: isPending,
                    onClick: handleDelete
                  }
                ]
              }
            ]
          : [])
      ]}
    />
  );
};

const InformationalAttributeRowActions = ({
  productId,
  attribute,
}: {
  productId: string;
  attribute: ProductInformationalAttribute;
}) => {
  const { t } = useTranslation();
  const prompt = usePrompt();
  const { mutateAsync, isPending } = useRemoveProductAttribute(
    productId,
    attribute.attribute_id
  );

  const isVendorSource = attribute.attribute_source === 'vendor';

  const handleDelete = async () => {
    const res = await prompt({
      title: t('general.areYouSure'),
      description: t(
        'products.attributes.deleteWarning',
        'You are about to remove this attribute from the product. This action cannot be undone.'
      ) as string,
      confirmText: t('actions.delete'),
      cancelText: t('actions.cancel')
    });

    if (!res) {
      return;
    }

    await mutateAsync(undefined, {
      onError: (err) => {
        toast.error(err.message);
      }
    });
  };

  return (
    <ActionMenu
      groups={[
        {
          actions: [
            {
              icon: <PencilSquare />,
              label: t('actions.edit'),
              to: `informational-attributes/${attribute.attribute_id}/edit`,
            },
          ]
        },
        ...(isVendorSource
          ? [
              {
                actions: [
                  {
                    icon: <Trash />,
                    label: t('actions.delete'),
                    disabled: isPending,
                    onClick: handleDelete
                  }
                ]
              }
            ]
          : [])
      ]}
    />
  );
};

export const ProductAdditionalAttributesSection = ({ product }: ProductAttributeSectionProps) => {
  const { t } = useTranslation();

  const informationalAttributes =
    product.informational_attributes?.filter(Boolean) ?? [];
  const options = product.options?.filter(Boolean) ?? [];

  const getInformationalAttributeDisplayValue = (
    v: ProductInformationalAttributeValue
  ): string => {
    return v.value;
  };

  if (!informationalAttributes.length && !options.length) {
    return null;
  }

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <Heading>{t('products.attributes')}</Heading>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  label: t('actions.add'),
                  to: 'attributes/add',
                  icon: <Plus />
                }
              ]
            }
          ]}
        />
      </div>

      {options.length > 0 && (
        <div className="px-6 py-4">
          <div className="flex items-center gap-x-3 pb-4">
            <div className="bg-ui-bg-base shadow-borders-base flex size-7 items-center justify-center rounded-md">
              <div className="bg-ui-bg-component flex size-6 items-center justify-center rounded-[4px]">
                <SquareTwoStack className="text-ui-fg-subtle" />
              </div>
            </div>
            <div>
              <Text size="small" weight="plus" leading="compact">
                {t('products.options.variations', 'Variations')}
              </Text>
              <Text size="xsmall" leading="compact" className="text-ui-fg-subtle">
                {t('products.options.variationsDescription', 'Attributes used for variations')}
              </Text>
            </div>
          </div>
          <div className="overflow-hidden divide-y rounded-lg border">
            {options.map(option => (
              <SectionRow
                key={option.id}
                title={option.title}
                actions={
                  <OptionRowActions
                    productId={product.id}
                    option={option}
                  />
                }
                value={option.values?.map((value, index) => (
                  <Badge
                    key={`${option.id}-${value.value}-${index}`}
                    size="2xsmall"
                    className="flex min-w-[20px] items-center justify-center"
                  >
                    {value.value}
                  </Badge>
                ))}
              />
            ))}
          </div>
        </div>
      )}

      {options.length > 0 && informationalAttributes.length > 0 && (
        <div className="border-t border-dashed border-ui-border-base" />
      )}

      {informationalAttributes.length > 0 && (
        <div className="px-6 py-4">
          <div className="flex items-center gap-x-3 pb-4">
            <div className="bg-ui-bg-base shadow-borders-base flex size-7 items-center justify-center rounded-md">
              <div className="bg-ui-bg-component flex size-6 items-center justify-center rounded-[4px]">
                <AdjustmentsDone className="text-ui-fg-subtle" />
              </div>
            </div>
            <div>
              <Text size="small" weight="plus" leading="compact">
                {t('products.informationalAttributes.header', 'Product Information')}
              </Text>
              <Text size="xsmall" leading="compact" className="text-ui-fg-subtle">
                {t('products.informationalAttributes.description', 'Attributes used for informational purposes')}
              </Text>
            </div>
          </div>
          <div className="overflow-hidden divide-y rounded-lg border">
            {informationalAttributes.map(attribute => (
              <SectionRow
                key={`${attribute.attribute_id}-${attribute.attribute_source}`}
                title={attribute.name}
                actions={
                  <InformationalAttributeRowActions
                    productId={product.id}
                    attribute={attribute}
                  />
                }
                value={
                  attribute.values?.length
                    ? attribute.values
                        .map(v => getInformationalAttributeDisplayValue(v))
                        .join(', ')
                    : '-'
                }
                tooltip={attribute.description ?? undefined}
              />
            ))}
          </div>
        </div>
      )}
    </Container>
  );
};
