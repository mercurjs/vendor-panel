import { Select } from "@medusajs/ui";

import type { ControllerRenderProps } from "react-hook-form";

import type { ProductAttributePossibleValue } from "@custom-types/products";

export const AttributeSelect = ({
  values,
  field,
}: {
  values: ProductAttributePossibleValue[];
  field: ControllerRenderProps<Record<string, string>, string>;
}) => {
  const handleChange = (value: string) => {
    field.onChange(value);
  };

  return (
    <Select onValueChange={(value) => handleChange(value)} value={field.value}>
      <Select.Trigger className="bg-ui-bg-base">
        <Select.Value placeholder="Select value" />
      </Select.Trigger>
      <Select.Content>
        {values.map(({ id, attribute_id, value }) => (
          <Select.Item
            key={`select-option-${attribute_id}-${id}`}
            value={value}
          >
            {value}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};
