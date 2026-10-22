import React, { useState } from 'react';
import { Edit3, Save, X } from 'lucide-react';
import { isValidPriceRange } from '../../core/normalize';
import { useStore } from '../../store/useStore';
import type { PriceRange } from '../../types/product';
import { Button, IconButton, NumberInput } from '../ui';

interface CategoryPriceEditorProps {
  categoryId: string;
  priceRange: PriceRange;
}

export const CategoryPriceEditor: React.FC<CategoryPriceEditorProps> = ({
  categoryId,
  priceRange,
}) => {
  const updateCategoryPriceRange = useStore(
    (state) => state.updateCategoryPriceRange,
  );
  const [editing, setEditing] = useState(false);
  const [min, setMin] = useState(priceRange.min);
  const [max, setMax] = useState(priceRange.max);

  const startEditing = () => {
    setMin(priceRange.min);
    setMax(priceRange.max);
    setEditing(true);
  };

  const save = () => {
    if (!isValidPriceRange(min, max)) return;

    updateCategoryPriceRange(categoryId, min, max);
    setEditing(false);
  };

  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300">Price Range</span>
        {!editing && (
          <IconButton
            label="Edit category price range"
            onClick={startEditing}
            className="hover:bg-slate-700"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </IconButton>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <NumberInput
              min={0}
              placeholder="Min"
              aria-label="Minimum category price"
              value={min}
              onValueChange={setMin}
              className="flex-1"
            />
            <NumberInput
              min={0}
              placeholder="Max"
              aria-label="Maximum category price"
              value={max}
              onValueChange={setMax}
              className="flex-1"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="success"
              size="sm"
              onClick={save}
              className="flex-1"
            >
              <Save className="h-3 w-3" />
              Save
            </Button>
            <Button
              size="sm"
              onClick={() => setEditing(false)}
              className="flex-1"
            >
              <X className="h-3 w-3" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-slate-400">
          ${priceRange.min} - ${priceRange.max}
        </div>
      )}
    </div>
  );
};

CategoryPriceEditor.displayName = 'CategoryPriceEditor';
