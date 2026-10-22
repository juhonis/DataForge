import React, { useState } from 'react';
import {
  ChevronDown,
  Edit3,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
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
import { BrandPriceEditor } from './BrandPriceEditor';
import { ModelRow } from './ModelRow';

interface BrandRowProps {
  brand: Brand;
}

const BrandRowComponent: React.FC<BrandRowProps> = ({ brand }) => {
  const selected = useStore((state) =>
    state.selectedBrands.includes(brand.id),
  );
  const toggleBrand = useStore((state) => state.toggleBrand);
  const removeBrand = useStore((state) => state.removeBrand);
  const updateBrand = useStore((state) => state.updateBrand);
  const updateBrandWeight = useStore((state) => state.updateBrandWeight);
  const addBrandModel = useStore((state) => state.addBrandModel);
  const selectAllBrandModels = useStore(
    (state) => state.selectAllBrandModels,
  );
  const deselectAllBrandModels = useStore(
    (state) => state.deselectAllBrandModels,
  );

  const [expanded, setExpanded] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(brand.name);
  const [addingModel, setAddingModel] = useState(false);
  const [newModelName, setNewModelName] = useState('');

  const startEditingName = () => {
    setName(brand.name);
    setEditingName(true);
  };

  const saveName = () => {
    if (!name.trim()) return;

    updateBrand(brand.id, name.trim());
    setEditingName(false);
  };

  const addModel = () => {
    if (!newModelName.trim()) return;

    addBrandModel(brand.id, newModelName.trim());
    setNewModelName('');
  };

  const cancelAddModel = () => {
    setAddingModel(false);
    setNewModelName('');
  };

  const contentId = `brand-${brand.id}-content`;

  return (
    <div
      className={`border transition-colors ${
        selected
          ? 'border-accent/50 bg-accent-muted'
          : 'border-border bg-surface-muted'
      }`}
    >
      <div className="flex items-center gap-2 p-3">
        <Checkbox
          checked={selected}
          onChange={() => toggleBrand(brand.id)}
          aria-label={`Select ${brand.name}`}
        />

        {editingName ? (
          <div className="flex flex-1 items-center gap-2">
            <Input
              variant="bare"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') saveName();
                if (event.key === 'Escape') setEditingName(false);
              }}
              aria-label={`Brand name for ${brand.name}`}
              className="min-w-0 flex-1 border border-accent bg-surface px-2 py-1 text-sm text-text"
            />
            <IconButton
              variant="success"
              label={`Save brand name ${brand.name}`}
              onClick={saveName}
            >
              <Save className="h-3 w-3" />
            </IconButton>
            <IconButton
              variant="danger"
              label={`Cancel renaming brand ${brand.name}`}
              onClick={() => setEditingName(false)}
            >
              <X className="h-3 w-3" />
            </IconButton>
          </div>
        ) : (
          <>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-text">
              {brand.name}
            </span>
            <Badge
              tone={
                brand.selectedModels.length > 0 ? 'accent' : 'neutral'
              }
            >
              {brand.selectedModels.length}/{brand.models.length} models
            </Badge>
            <IconButton
              label={`Rename brand ${brand.name}`}
              onClick={startEditingName}
              className="hover:bg-border"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton
              variant="danger"
              label={`Delete brand ${brand.name}`}
              onClick={() => removeBrand(brand.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton
              label={`${expanded ? 'Collapse' : 'Expand'} ${
                brand.name
              } models`}
              aria-expanded={expanded}
              aria-controls={contentId}
              onClick={() => setExpanded((value) => !value)}
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  expanded ? 'rotate-180' : ''
                }`}
              />
            </IconButton>
          </>
        )}
      </div>

      {expanded && (
        <div
          id={contentId}
          className="border-t border-border px-3 pb-3"
        >
          <div className="flex items-center justify-between pb-2 pt-3">
            <label
              htmlFor={`brand-weight-${brand.id}`}
              className="text-xs font-semibold text-muted"
            >
              Selection Weight
            </label>
            <NumberInput
              id={`brand-weight-${brand.id}`}
              variant="bare"
              min={0.1}
              max={100}
              step={0.1}
              value={brand.weight ?? 1}
              onValueChange={(weight) => updateBrandWeight(brand.id, weight)}
              className="w-16 border border-border bg-surface px-2 py-1 text-right text-xs text-text"
            />
          </div>

          <BrandPriceEditor brand={brand} />

          <div className="flex items-center justify-between border-t border-border pb-1 pt-2">
            <span className="text-xs font-semibold text-muted">
              Select Models ({brand.selectedModels.length}/
              {brand.models.length})
            </span>
            <div className="flex gap-1">
              <Button
                variant="plain"
                size="sm"
                onClick={() => selectAllBrandModels(brand.id)}
                className="px-1.5 py-0.5 text-[10px] text-accent hover:text-accent-hover"
              >
                All
              </Button>
              <span className="text-border">|</span>
              <Button
                variant="plain"
                size="sm"
                onClick={() => deselectAllBrandModels(brand.id)}
                className="px-1.5 py-0.5 text-[10px] text-muted hover:text-text"
              >
                None
              </Button>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {brand.models.length > 0 ? (
              <div className="space-y-1">
                {brand.models.map((model) => (
                  <ModelRow key={model} brand={brand} model={model} />
                ))}
              </div>
            ) : (
              <div className="py-2 text-xs italic text-muted">
                No models defined
              </div>
            )}

            {addingModel ? (
              <div className="mt-2 flex gap-2">
                <Input
                  value={newModelName}
                  onChange={(event) => setNewModelName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') addModel();
                    if (event.key === 'Escape') cancelAddModel();
                  }}
                  placeholder="Model name..."
                  aria-label={`New model for ${brand.name}`}
                  className="min-w-0 flex-1"
                />
                <IconButton
                  variant="plain"
                  label={`Add model to ${brand.name}`}
                  onClick={addModel}
                  disabled={!newModelName.trim()}
                  className="bg-success text-on-success hover:bg-success-hover disabled:bg-surface-muted disabled:text-muted"
                >
                  <Save className="h-4 w-4" />
                </IconButton>
                <IconButton
                  variant="plain"
                  label={`Cancel adding model to ${brand.name}`}
                  onClick={cancelAddModel}
                  className="bg-surface-muted text-text hover:bg-border"
                >
                  <X className="h-4 w-4" />
                </IconButton>
              </div>
            ) : (
              <Button
                variant="plain"
                size="sm"
                onClick={() => setAddingModel(true)}
                className="mt-2 px-3 py-1.5 text-xs text-accent hover:text-accent-hover"
              >
                <Plus className="h-3 w-3" />
                Add Model
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const BrandRow = React.memo(BrandRowComponent);

BrandRow.displayName = 'BrandRow';
