import React, { forwardRef, useEffect, useRef, useState } from 'react';

import { Minus, Plus } from '@medusajs/icons';
import { Input } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';

export interface NumericInputProps {
  value?: number;
  onChange?: (value: number) => void;
  onBlur?: () => void;
  name?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  'aria-invalid'?: boolean;
}

export const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(
  (
    {
      value,
      onChange,
      onBlur,
      name,
      placeholder,
      min = 0,
      max = 999999,
      step = 1,
      disabled = false,
      className = '',
      'aria-invalid': ariaInvalid = false
    },
    ref
  ) => {
    const { t } = useTranslation();
    const [inputValue, setInputValue] = useState<string>(value?.toString() || '');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isMouseDownRef = useRef<boolean>(false);
    const currentValueRef = useRef<number>(0);
    const isUserTypingRef = useRef<boolean>(false);
    const previousValueRef = useRef<number | undefined>(value);

    // Update input value when prop value changes (but not during user input)
    useEffect(() => {
      if (value !== undefined && value !== previousValueRef.current) {
        // Only update if the prop value actually changed (not from user input)
        if (!isUserTypingRef.current) {
          setInputValue(value.toString());
          currentValueRef.current = value;
        }
        previousValueRef.current = value;
      }
    }, [value]);

    // Cleanup interval on unmount
    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      isUserTypingRef.current = true;

      // Only call onChange if the value is a valid number
      const numericValue = parseFloat(newValue);
      if (!isNaN(numericValue) && onChange) {
        currentValueRef.current = numericValue;
        onChange(numericValue);
      } else if (newValue === '' && onChange) {
        // Allow empty values - don't force to 0
        currentValueRef.current = 0;
        onChange(undefined as any); // Pass undefined to indicate empty
      } else if (newValue === '0' && onChange) {
        // Explicitly handle "0" as a valid value
        currentValueRef.current = 0;
        onChange(0);
      }
    };

    const handleIncrement = () => {
      if (disabled) return;

      // Always use the current inputValue as the source of truth for calculations
      const currentValue = parseFloat(inputValue) || 0;
      const newValue = Math.min(currentValue + step, max);

      currentValueRef.current = newValue;
      setInputValue(newValue.toString());
      if (onChange) {
        onChange(newValue);
      }
    };

    const handleDecrement = () => {
      if (disabled) return;

      // Always use the current inputValue as the source of truth for calculations
      const currentValue = parseFloat(inputValue) || 0;
      const newValue = Math.max(currentValue - step, min);

      currentValueRef.current = newValue;
      setInputValue(newValue.toString());
      if (onChange) {
        onChange(newValue);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleIncrement();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleDecrement();
      }
    };

    const handleBlur = () => {
      // Ensure value is within bounds on blur, but don't override valid values
      const numericValue = parseFloat(inputValue);
      if (!isNaN(numericValue)) {
        const clampedValue = Math.max(Math.min(numericValue, max), min);
        // Only update if the value actually needs clamping
        if (clampedValue !== numericValue) {
          setInputValue(clampedValue.toString());
          if (onChange) {
            onChange(clampedValue);
          }
        }
      }
      // Reset typing flag on blur with a small delay to prevent race conditions
      setTimeout(() => {
        isUserTypingRef.current = false;
      }, 100);
      if (onBlur) {
        onBlur();
      }
    };

    const clearRepeatInterval = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      isMouseDownRef.current = false;
    };

    const handleMouseDown = (action: 'increment' | 'decrement') => {
      if (disabled) return;

      isMouseDownRef.current = true;

      // Execute action immediately
      if (action === 'increment') {
        handleIncrement();
      } else {
        handleDecrement();
      }

      // Start interval after a short delay (like browser behavior)
      timeoutRef.current = setTimeout(() => {
        if (isMouseDownRef.current) {
          intervalRef.current = setInterval(() => {
            if (isMouseDownRef.current) {
              if (action === 'increment') {
                handleIncrement();
              } else {
                handleDecrement();
              }
            } else {
              clearRepeatInterval();
            }
          }, 50); // Fast repeat rate
        }
      }, 500); // Initial delay before repeating
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Prevent onClick from firing if we're using mouse hold functionality
      e.preventDefault();
    };

    const handleMouseUp = () => {
      clearRepeatInterval();
    };

    const handleMouseLeave = () => {
      clearRepeatInterval();
    };

    return (
      <div className={`relative w-full ${className}`}>
        <Input
          ref={ref}
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          name={name}
          placeholder={placeholder || t('products.fields.attributes.enterValuePlaceholder')}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          className="w-full pr-16 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <div className="absolute bottom-0 right-0 top-0 flex flex-row border-l border-ui-border-base">
          <button
            type="button"
            onClick={handleClick}
            onMouseDown={() => handleMouseDown('decrement')}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            disabled={disabled || (parseFloat(inputValue) || 0) <= min}
            className="bg-ui-field flex h-full w-8 items-center justify-center border-r border-ui-border-base transition-colors hover:bg-ui-bg-field-hover disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t('general.decrement')}
          >
            <Minus className="h-3 w-3 text-ui-fg-muted" />
          </button>
          <button
            type="button"
            onClick={handleClick}
            onMouseDown={() => handleMouseDown('increment')}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            disabled={disabled || (parseFloat(inputValue) || 0) >= max}
            className="bg-ui-field flex h-full w-8 items-center justify-center rounded-r-md transition-colors hover:bg-ui-bg-field-hover disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t('general.increment')}
          >
            <Plus className="h-3 w-3 text-ui-fg-muted" />
          </button>
        </div>
      </div>
    );
  }
);

NumericInput.displayName = 'NumericInput';
