import React, { useState } from 'react';
import { Edit3, Save, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Brand } from '../../types/product';
import {
  Badge,
  Button,
  Checkbox,
  IconButton,
  Input,
  NumberInput,
} from '../ui';

interface ModelRowProps {
  brand: Brand;
  model: string;
}

export const ModelRow: React.FC<ModelRowProps> = ({ brand, model }) => {
  const toggleBrandModel = useStore((state) => state.toggleBrandModel);
  const updateBrandModel = useStore((state) => state.updateBrandModel);
  const removeBrandModel = useStore((state) => state.removeBrandModel);
  const setModelPrice = useStore((state) => state.setModelPrice);
  const removeModelPrice = useStore((state) => state.removeModelPrice);

  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(model);
  const [editingPrice, setEditingPrice] = useState(false);
  const [price, setPrice] = useState(brand.modelPrices[model] ?? 0);

  const selected = brand.selectedModels.includes(model);
  const exactPrice = brand.modelPrices[model];

  const startEditingName = () => {
    setName(model);
    setEditingName(true);
  };

  const saveName = () => {
    if (!name.trim()) return;

    updateBrandModel(brand.id, model, name.trim());
    setEditingName(false);
  };

  const startEditingPrice = () => {
    setPrice(exactPrice ?? 0);
    setEditingPrice(true);
  };

  const savePrice = () => {
    if (price <= 0) return;

    setModelPrice(brand.id, model, price);
    setEditingPrice(false);
  };

  return (
    <div className="group flex items-start gap-2 p-1.5 transition-colors hover:bg-surface-muted">
      <Checkbox
        checked={selected}
        onChange={() => toggleBrandModel(brand.id, model)}
        aria-label={`Select ${brand.name} ${model}`}
        className="mt-0.5"
      />

      <div className="min-w-0 flex-1">
        {editingName ? (
          <div className="flex items-center gap-2">
            <Input
              variant="bare"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') saveName();
                if (event.key === 'Escape') setEditingName(false);
              }}
              aria-label={`Model name for ${model}`}
              className="min-w-0 flex-1 border border-accent bg-surface px-2 py-1 text-sm text-text"
            />
            <IconButton
              variant="success"
              label={`Save model name ${model}`}
              onClick={saveName}
            >
              <Save className="h-3 w-3" />
            </IconButton>
            <IconButton
              variant="danger"
              label={`Cancel renaming model ${model}`}
              onClick={() => setEditingName(false)}
            >
              <X className="h-3 w-3" />
            </IconButton>
          </div>
        ) : (
          <button
            type="button"
            onClick={startEditingName}
            aria-label={`Rename model ${model}`}
            className={`block max-w-full truncate text-left text-sm transition-colors hover:text-accent ${
              selected ? 'text-text' : 'text-muted'
            }`}
          >
            {model}
          </button>
        )}

        {editingPrice ? (
          <div className="mt-1 flex items-center gap-1">
            <span className="text-xs text-muted">$</span>
            <NumberInput
              variant="bare"
              min={0}
              value={price}
              onValueChange={setPrice}
              aria-label={`Exact price for ${brand.name} ${model}`}
              className="w-20 border border-accent bg-surface px-1.5 py-0.5 text-xs text-text"
            />
            <IconButton
              variant="success"
              label={`Save exact price for ${model}`}
              onClick={savePrice}
            >
              <Save className="h-3 w-3" />
            </IconButton>
            <IconButton
              variant="danger"
              label={`Cancel exact price edit for ${model}`}
              onClick={() => setEditingPrice(false)}
            >
              <X className="h-3 w-3" />
            </IconButton>
          </div>
        ) : exactPrice ? (
          <div className="mt-0.5 flex items-center gap-1">
            <Badge tone="warning">${exactPrice}</Badge>
            <IconButton
              label={`Edit exact price for ${model}`}
              onClick={startEditingPrice}
            >
              <Edit3 className="h-2.5 w-2.5" />
            </IconButton>
            <IconButton
              variant="danger"
              label={`Remove exact price for ${model}`}
              onClick={() => removeModelPrice(brand.id, model)}
            >
              <X className="h-2.5 w-2.5" />
            </IconButton>
          </div>
        ) : (
          <Button
            variant="plain"
            size="sm"
            onClick={startEditingPrice}
            className="mt-0.5 px-0 py-0 text-[10px] text-muted hover:text-accent"
          >
            + Set price
          </Button>
        )}
      </div>

      <IconButton
        variant="danger"
        label={`Remove model ${model}`}
        onClick={() => removeBrandModel(brand.id, model)}
        className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <X className="h-3 w-3" />
      </IconButton>
    </div>
  );
};

ModelRow.displayName = 'ModelRow';
