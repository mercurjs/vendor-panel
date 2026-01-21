import { PencilSquare, Plus, Trash } from '@medusajs/icons';
import { Badge, Container, Heading, toast, usePrompt } from '@medusajs/ui';
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
  comingSoon,
}: {
  productId: string;
  option: ExtendedAdminProductOption;
  comingSoon: string;
}) => {
  const { t } = useTranslation();
  const prompt = usePrompt();
  const { mutateAsync, isPending } = useDeleteProductOption(productId, option.id);

  const isVendor = option.metadata?.author === 'vendor';

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
              disabled: true,
              disabledTooltip: comingSoon,
              onClick: () => undefined
            },
            ...(isVendor
              ? [
                  {
                    icon: <Trash />,
                    label: t('actions.delete'),
                    disabled: isPending,
                    onClick: handleDelete
                  }
                ]
              : [])
          ]
        }
      ]}
    />
  );
};

const InformationalAttributeRowActions = ({
  productId,
  attribute,
  comingSoon,
}: {
  productId: string;
  attribute: ProductInformationalAttribute;
  comingSoon: string;
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
      description: (t(
        'products.attributes.deleteWarning',
        'You are about to remove this attribute from the product. This action cannot be undone.'
      ) as string),
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
              disabled: true,
              disabledTooltip: comingSoon,
              onClick: () => undefined
            },
            ...(isVendorSource
              ? [
                  {
                    icon: <Trash />,
                    label: t('actions.delete'),
                    disabled: isPending,
                    onClick: handleDelete
                  }
                ]
              : [])
          ]
        }
      ]}
    />
  );
};

export const ProductAdditionalAttributesSection = ({ product }: ProductAttributeSectionProps) => {
  const { t } = useTranslation();

  const informationalAttributes =
    product.informational_attributes?.filter(Boolean) ?? [];
  const options = product.options?.filter(Boolean) ?? [];
  const comingSoon = t('general.comingSoon', 'Coming soon') as string;

  const getInformationalAttributeDisplayValue = (
    v: ProductInformationalAttributeValue
  ): string => {
    return v.value;
  };

  const getInformationalAttributeValueKey = (
    attributeId: string,
    v: ProductInformationalAttributeValue,
    index: number
  ) => {
    const display = getInformationalAttributeDisplayValue(v);
    const stable = v.attribute_value_id ?? `${v.source}:${display}`;
    return `${attributeId}-${stable}-${index}`;
  };

  if (!informationalAttributes.length && !options.length) {
    return null;
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
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
      {informationalAttributes.length > 0 && (
        <>
          <div className="flex items-center justify-between px-6 py-4">
            <Heading>Informational attributes</Heading>
          </div>
          {informationalAttributes.map(attribute => (
            <SectionRow
              key={`${attribute.attribute_id}-${attribute.attribute_source}`}
              title={attribute.name}
              actions={
                <InformationalAttributeRowActions
                  productId={product.id}
                  attribute={attribute}
                  comingSoon={comingSoon}
                />
              }
              value={
                attribute.values?.length ? (
                  attribute.values.map((value, index) => (
                    <Badge
                      key={getInformationalAttributeValueKey(
                        attribute.attribute_id,
                        value,
                        index
                      )}
                      size="2xsmall"
                      className="flex min-w-[20px] items-center justify-center"
                    >
                      {getInformationalAttributeDisplayValue(value)}
                    </Badge>
                  ))
                ) : (
                  '-'
                )
              }
              tooltip={attribute.description ?? undefined}
            />
          ))}
        </>
      )}
      {options.length > 0 && (
        <>
          <div className="flex items-center justify-between px-6 py-4">
            <Heading>{t('products.options.header')}</Heading>
          </div>
          {options.map(option => (
            <SectionRow
              key={option.id}
              title={option.title}
              actions={
                <OptionRowActions
                  productId={product.id}
                  option={option}
                  comingSoon={comingSoon}
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
        </>
      )}
    </Container>
  );
};
