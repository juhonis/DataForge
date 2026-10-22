import React, { useRef, useState } from 'react';
import { Input, type InputProps } from './Input';
import { normalizeNumberInput } from './normalizeNumberInput';

export interface NumberInputProps
  extends Omit<
    InputProps,
    'type' | 'value' | 'onChange' | 'min' | 'max' | 'step'
  > {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number | 'any';
  integer?: boolean;
}

export const NumberInput = React.forwardRef<
  HTMLInputElement,
  NumberInputProps
>(
  (
    {
      value,
      onValueChange,
      min,
      max,
      step,
      integer = false,
      onBlur,
      onKeyDown,
      inputMode,
      ...props
    },
    ref,
  ) => {
    const [draft, setDraft] = useState<string | null>(null);
    const wasCancelled = useRef(false);

    const commit = () => {
      if (wasCancelled.current) {
        wasCancelled.current = false;
        setDraft(null);
        return;
      }

      const next = normalizeNumberInput(draft ?? String(value), {
        value,
        min,
        max,
        integer,
      });

      if (next !== value) onValueChange(next);
      setDraft(null);
    };

    return (
      <Input
        ref={ref}
        {...props}
        type="number"
        min={min}
        max={max}
        step={step ?? (integer ? 1 : 'any')}
        inputMode={inputMode ?? (integer ? 'numeric' : 'decimal')}
        value={draft ?? String(value)}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={(event) => {
          commit();
          onBlur?.(event);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);

          if (event.defaultPrevented) return;

          if (event.key === 'Enter') {
            event.currentTarget.blur();
          } else if (event.key === 'Escape') {
            wasCancelled.current = true;
            setDraft(null);
            event.currentTarget.blur();
          }
        }}
      />
    );
  },
);

NumberInput.displayName = 'NumberInput';
