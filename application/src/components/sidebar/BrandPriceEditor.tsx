import React, { useState } from 'react';
import { Edit3, Save, X } from 'lucide-react';
import { isValidPriceRange } from '../../core/normalize';
import { useStore } from '../../store/useStore';
import type { Brand } from '../../types/product';
import { Button, IconButton, NumberInput } from '../ui';

interface BrandPriceEditorProps {
  brand: Brand;
}

export const BrandPriceEditor: React.FC<BrandPriceEditorProps> = ({ brand }) => {
  const categoryPriceRange = useStore(
    (state) => state.selectedCategory.priceRange,
  );
  const updateBrandPriceRange = useStore(
    (state) => state.updateBrandPriceRange,
  );
  const removeBrandPriceRange = useStore(
    (state) => state.removeBrandPriceRange,
  );

  const [editing, setEditing] = useState(false);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);

  const startEditing = () => {
    setMin(brand.priceRange?.min ?? categoryPriceRange.min);
    setMax(brand.priceRange?.max ?? categoryPriceRange.max);
    setEditing(true);
  };

  const save = () => {
    if (!isValidPriceRange(min, max)) return;

    updateBrandPriceRange(brand.id, min, max);
    setEditing(false);
  };

  return (
    <div className="flex items-center justify-between border-t border-slate-700/20 pt-2 pb-2">
      <span className="text-xs font-bold text-slate-400">
        Brand Price Range
      </span>

      <div className="flex items-center gap-1">
        {editing ? (
          <>
            <NumberInput
              variant="bare"
              min={0}
              placeholder="Min"
              aria-label={`Minimum price for ${brand.name}`}
              value={min}
              onValueChange={setMin}
              className="w-16 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200"
            />
            <span className="text-slate-500">-</span>
            <NumberInput
              variant="bare"
              min={0}
              placeholder="Max"
              aria-label={`Maximum price for ${brand.name}`}
              value={max}
              onValueChange={setMax}
              className="w-16 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200"
            />
            <IconButton
              variant="success"
              label={`Save price range for ${brand.name}`}
              onClick={save}
            >
              <Save className="h-3 w-3" />
            </IconButton>
            <IconButton
              variant="danger"
              label={`Cancel price range edit for ${brand.name}`}
              onClick={() => setEditing(false)}
            >
              <X className="h-3 w-3" />
            </IconButton>
          </>
        ) : brand.priceRange ? (
          <>
            <span className="text-xs text-indigo-400">
              ${brand.priceRange.min}-${brand.priceRange.max}
            </span>
            <IconButton
              label={`Edit price range for ${brand.name}`}
              onClick={startEditing}
            >
              <Edit3 className="h-3 w-3" />
            </IconButton>
            <IconButton
              variant="danger"
              label={`Remove price override for ${brand.name}`}
              onClick={() => removeBrandPriceRange(brand.id)}
            >
              <X className="h-3 w-3" />
            </IconButton>
          </>
        ) : (
          <Button
            variant="plain"
            size="sm"
            onClick={startEditing}
            className="px-1 py-0 text-xs text-slate-500 hover:text-indigo-400"
          >
            + Set price
          </Button>
        )}
      </div>
    </div>
  );
};

BrandPriceEditor.displayName = 'BrandPriceEditor';
