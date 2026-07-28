import { ReactNode } from 'react';

import { Switch } from '@medusajs/ui';
import { ControllerProps, FieldPath, FieldValues } from 'react-hook-form';

import { Form } from '../../common/form';

interface HeadlessControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<ControllerProps<TFieldValues, TName>, 'render'> {}

interface SwitchBoxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends HeadlessControllerProps<TFieldValues, TName> {
  label: string;
  description: string;
  optional?: boolean;
  tooltip?: ReactNode;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

export const SwitchBox = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  label,
  description,
  optional = false,
  tooltip,
  onCheckedChange,
  disabled,
  className,
  ...props
}: SwitchBoxProps<TFieldValues, TName>) => {
  return (
    <Form.Field
      {...props}
      disabled={disabled}
      render={({ field: { value, onChange, ...field } }) => {
        return (
          <Form.Item className={className}>
            <div className="flex items-start gap-x-3 rounded-lg bg-ui-bg-component p-3 shadow-elevation-card-rest">
              <Form.Control>
                <Switch
                  {...field}
                  checked={value}
                  className="flex-none"
                  disabled={disabled}
                  onCheckedChange={e => {
                    if (!disabled) {
                      onCheckedChange?.(e);
                      onChange(e);
                    }
                  }}
                />
              </Form.Control>
              <div>
                <Form.Label
                  optional={optional}
                  tooltip={tooltip}
                >
                  {label}
                </Form.Label>
                <Form.Hint>{description}</Form.Hint>
              </div>
            </div>
            <Form.ErrorMessage />
          </Form.Item>
        );
      }}
    />
  );
};
