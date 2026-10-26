import React from 'react';
import { Dices } from 'lucide-react';
import { useStore } from '../../store/useStore';
import {
  Button,
  Field,
  Input,
  NumberInput,
} from '../ui';

const PRODUCT_COUNTS = [5, 10, 25, 50, 100] as const;
const MAX_SEED = 1_000_000_000;

export const GenerationPanel: React.FC = () => {
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);

  const updateMinOrders = (min: number) => {
    updateSettings({
      ordersPerCustomer: {
        min,
        max: Math.max(min, settings.ordersPerCustomer.max),
      },
    });
  };

  const updateMaxOrders = (max: number) => {
    updateSettings({
      ordersPerCustomer: {
        min: Math.min(max, settings.ordersPerCustomer.min),
        max,
      },
    });
  };

  const randomizeSeed = () => {
    const values = new Uint32Array(1);

    crypto.getRandomValues(values);
    updateSettings({ seed: values[0] % MAX_SEED });
  };

  return (
    <div className="space-y-4 p-4">
      <section className="border border-border bg-surface-muted p-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text">
          Products
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Choose how many products to include in the generated dataset.
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {PRODUCT_COUNTS.map((count) => (
            <Button
              key={count}
              size="sm"
              variant={
                settings.productCount === count ? 'primary' : 'secondary'
              }
              aria-pressed={settings.productCount === count}
              onClick={() => updateSettings({ productCount: count })}
              className="min-w-9"
            >
              {count}
            </Button>
          ))}
        </div>

        <Field
          label="Custom count"
          htmlFor="generation-product-count"
          className="mt-3"
        >
          <NumberInput
            id="generation-product-count"
            min={1}
            max={1000}
            integer
            value={settings.productCount}
            onValueChange={(productCount) =>
              updateSettings({ productCount })
            }
          />
        </Field>
      </section>

      <section className="border border-border bg-surface-muted p-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text">
          Seed
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          The same seed and configuration produce the same dataset.
        </p>

        <div className="mt-3 flex items-end gap-2">
          <Field
            label="Seed value"
            htmlFor="generation-seed"
            className="min-w-0 flex-1"
          >
            <NumberInput
              id="generation-seed"
              min={0}
              max={MAX_SEED}
              integer
              value={settings.seed}
              onValueChange={(seed) => updateSettings({ seed })}
            />
          </Field>

          <Button
            variant="secondary"
            onClick={randomizeSeed}
            className="shrink-0"
          >
            <Dices className="h-4 w-4" />
            Randomize
          </Button>
        </div>
      </section>

      <section className="border border-border bg-surface-muted p-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text">
          Reference time
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Customer, order, and review timestamps use this saved UTC time.
          Keep it unchanged to reproduce the same dataset.
        </p>
        <Field label="Date and time (UTC)" htmlFor="generation-reference-time" className="mt-3">
          <Input
            id="generation-reference-time"
            type="datetime-local"
            step="0.001"
            min="0001-01-01T00:00"
            max="9999-12-31T23:59:59.999"
            value={settings.referenceTime.slice(0, -1)}
            onChange={(event) => {
              const value = event.target.value;
              if (!value || !event.target.validity.valid) return;
              const date = new Date(`${value}Z`);
              if (Number.isFinite(date.getTime())) {
                updateSettings({ referenceTime: date.toISOString() });
              }
            }}
          />
        </Field>
        <Button
          variant="secondary"
          className="mt-3"
          onClick={() => updateSettings({ referenceTime: new Date().toISOString() })}
        >
          Use current time
        </Button>
      </section>

      <section className="border border-border bg-surface-muted p-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text">
          Related data
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Configure customers, orders, and reviews generated alongside the
          products.
        </p>

        <div className="mt-3 space-y-3">
          <Field label="Customers" htmlFor="generation-customers">
            <NumberInput
              id="generation-customers"
              min={0}
              max={1000}
              integer
              value={settings.customerCount}
              onValueChange={(customerCount) =>
                updateSettings({ customerCount })
              }
            />
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field
              label="Min orders"
              htmlFor="generation-min-orders"
            >
              <NumberInput
                id="generation-min-orders"
                min={0}
                max={10}
                integer
                value={settings.ordersPerCustomer.min}
                onValueChange={updateMinOrders}
              />
            </Field>

            <Field
              label="Max orders"
              htmlFor="generation-max-orders"
            >
              <NumberInput
                id="generation-max-orders"
                min={0}
                max={10}
                integer
                value={settings.ordersPerCustomer.max}
                onValueChange={updateMaxOrders}
              />
            </Field>
          </div>

          <Field label="Reviews" htmlFor="generation-reviews">
            <NumberInput
              id="generation-reviews"
              min={0}
              max={1000}
              integer
              value={settings.reviewCount}
              onValueChange={(reviewCount) =>
                updateSettings({ reviewCount })
              }
            />
          </Field>
        </div>
      </section>
    </div>
  );
};

GenerationPanel.displayName = 'GenerationPanel';
