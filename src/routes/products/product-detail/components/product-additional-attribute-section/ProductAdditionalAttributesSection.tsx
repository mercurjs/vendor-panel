import { Plus } from '@medusajs/icons';
import { Badge, Container, Heading } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';

import { ActionMenu } from '../../../../../components/common/action-menu';
import { SectionRow } from '../../../../../components/common/section';
import {
  ExtendedAdminProduct,
  ProductInformationalAttributeValue,
} from '../../../../../types/products';

type ProductAttributeSectionProps = {
  product: ExtendedAdminProduct;
};

export const ProductAdditionalAttributesSection = ({ product }: ProductAttributeSectionProps) => {
  const { t } = useTranslation();

  const informationalAttributes =
    product.informational_attributes?.filter(Boolean) ?? [];
  const options = product.options?.filter(Boolean) ?? [];

  const getInformationalAttributeDisplayValue = (
    v: string | ProductInformationalAttributeValue
  ): string => {
    if (typeof v === 'string') {
      return v;
    }

    if (v && typeof v.value === 'string') {
      return v.value;
    }

    return '-';
  };

  const getInformationalAttributeValueKey = (
    attributeId: string,
    v: string | ProductInformationalAttributeValue,
    index: number
  ) => {
    if (typeof v === 'string') {
      return `${attributeId}-${v}-${index}`;
    }

    const display = getInformationalAttributeDisplayValue(v);
    const stable = v.attribute_value_id ?? `${v.source ?? 'unknown'}:${display}`;
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
              key={`${attribute.attribute_id}-${attribute.source}`}
              title={attribute.name}
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
