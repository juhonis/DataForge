import React, { useState } from 'react';
import { Car, Plus, RefreshCw } from 'lucide-react';
import { useStore } from '../../store/useStore';
import {
  Badge,
  Button,
  CollapsibleSection,
  IconButton,
  Input,
} from '../ui';
import { BrandRow } from './BrandRow';

interface BrandSectionProps {
  expanded: boolean;
  onToggle: () => void;
}

export const BrandSection: React.FC<BrandSectionProps> = ({
  expanded,
  onToggle,
}) => {
  const brands = useStore((state) => state.brands);
  const selectedBrands = useStore((state) => state.selectedBrands);
  const addBrand = useStore((state) => state.addBrand);
  const resetBrands = useStore((state) => state.resetBrands);
  const selectAllBrands = useStore((state) => state.selectAllBrands);
  const deselectAllBrands = useStore((state) => state.deselectAllBrands);

  const [newBrandName, setNewBrandName] = useState('');

  const handleAddBrand = () => {
    if (!newBrandName.trim()) return;

    addBrand(newBrandName.trim());
    setNewBrandName('');
  };

  return (
    <CollapsibleSection
      id="brands"
      title="Brands & Models"
      icon={<Car className="h-3 w-3" />}
      badge={<Badge>{brands.length}</Badge>}
      expanded={expanded}
      onToggle={onToggle}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newBrandName}
            onChange={(event) => setNewBrandName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleAddBrand();
            }}
            placeholder="New brand name..."
            aria-label="New brand name"
            className="min-w-0 flex-1"
          />
          <IconButton
            variant="plain"
            label="Add brand"
            onClick={handleAddBrand}
            disabled={!newBrandName.trim()}
            className="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600"
          >
            <Plus className="h-4 w-4" />
          </IconButton>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {selectedBrands.length} of {brands.length} selected
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="plain"
              size="sm"
              onClick={selectAllBrands}
              className="px-1 py-0.5 text-indigo-400 hover:text-indigo-300"
            >
              All
            </Button>
            <span className="text-slate-600">|</span>
            <Button
              variant="plain"
              size="sm"
              onClick={deselectAllBrands}
              className="px-1 py-0.5 text-slate-500 hover:text-slate-300"
            >
              None
            </Button>
            <span className="text-slate-600">|</span>
            <Button
              variant="plain"
              size="sm"
              onClick={resetBrands}
              className="flex items-center gap-1 px-1 py-0.5 text-slate-500 hover:text-slate-300"
            >
              <RefreshCw className="h-3 w-3" />
              Reset
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {brands.map((brand) => (
            <BrandRow key={brand.id} brand={brand} />
          ))}
        </div>
      </div>
    </CollapsibleSection>
  );
};

BrandSection.displayName = 'BrandSection';
