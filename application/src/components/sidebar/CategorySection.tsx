import React, { useState } from 'react';
import { Save, Settings2, Tag, X } from 'lucide-react';
import { normalizeSkuPrefix, slugify } from '../../core/normalize';
import { useStore } from '../../store/useStore';
import type { CategoryTemplate } from '../../types/product';
import {
  Button,
  CollapsibleSection,
  Field,
  IconButton,
  Input,
  Select,
} from '../ui';
import { CategoryPriceEditor } from './CategoryPriceEditor';

interface CategorySectionProps {
  expanded: boolean;
  onToggle: () => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  expanded,
  onToggle,
}) => {
  const categories = useStore((state) => state.categories);
  const selectedCategory = useStore((state) => state.selectedCategory);
  const setSelectedCategory = useStore((state) => state.setSelectedCategory);
  const updateCategory = useStore((state) => state.updateCategory);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [skuPrefix, setSkuPrefix] = useState('');
  const [idFormat, setIdFormat] = useState<'uuid' | 'sequential' | 'custom'>(
    'uuid',
  );
  const [idPrefix, setIdPrefix] = useState('');

  const startEditing = () => {
    setName(selectedCategory.name);
    setSkuPrefix(selectedCategory.skuPrefix);
    setIdFormat(selectedCategory.idFormat || 'uuid');
    setIdPrefix(selectedCategory.idPrefix || '');
    setEditing(true);
  };

  const save = () => {
    if (!name.trim() || !skuPrefix.trim()) return;

    const updates: Partial<CategoryTemplate> = {
      name: name.trim(),
      skuPrefix: normalizeSkuPrefix(skuPrefix),
      slug: slugify(name),
      idFormat,
    };

    if (idFormat === 'custom') {
      updates.idPrefix = idPrefix;
    }

    updateCategory(selectedCategory.id, updates);
    setEditing(false);
  };

  const selectCategory = (categoryId: string) => {
    const category = categories.find((item) => item.id === categoryId);

    if (category) setSelectedCategory(category);
  };

  return (
    <CollapsibleSection
      id="category"
      title="Category Settings"
      icon={<Tag className="h-3 w-3" />}
      expanded={expanded}
      onToggle={onToggle}
    >
      <div className="space-y-3">
        <Field label="Category" htmlFor="category-select">
          <Select
            id="category-select"
            value={selectedCategory.id}
            onChange={(event) => selectCategory(event.target.value)}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </Field>

        {editing ? (
          <div className="space-y-3 rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
            <Field label="Category Name" htmlFor="edit-category-name">
              <Input
                id="edit-category-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Field>

            <Field label="SKU Prefix" htmlFor="edit-sku-prefix">
              <Input
                id="edit-sku-prefix"
                value={skuPrefix}
                onChange={(event) =>
                  setSkuPrefix(normalizeSkuPrefix(event.target.value))
                }
                className="font-mono"
              />
            </Field>

            <Field label="ID Format" htmlFor="edit-id-format">
              <Select
                id="edit-id-format"
                value={idFormat}
                onChange={(event) =>
                  setIdFormat(
                    event.target.value as 'uuid' | 'sequential' | 'custom',
                  )
                }
              >
                <option value="uuid">UUID</option>
                <option value="sequential">Sequential</option>
                <option value="custom">Custom</option>
              </Select>
            </Field>

            {idFormat === 'custom' && (
              <Field label="ID Prefix" htmlFor="edit-id-prefix">
                <Input
                  id="edit-id-prefix"
                  value={idPrefix}
                  onChange={(event) => setIdPrefix(event.target.value)}
                  placeholder="e.g., PROD-"
                  className="font-mono"
                />
              </Field>
            )}

            <div className="flex gap-2">
              <Button
                variant="success"
                size="sm"
                onClick={save}
                className="flex-1"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button
                size="sm"
                onClick={() => setEditing(false)}
                className="flex-1"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="mb-1 text-[10px] font-bold uppercase text-slate-500">
                  SKU Prefix
                </div>
                <div className="rounded border border-slate-700 bg-slate-950 px-3 py-1.5 font-mono text-sm text-indigo-400">
                  {selectedCategory.skuPrefix}-
                </div>
              </div>
              <IconButton
                label="Edit category settings"
                onClick={startEditing}
                className="hover:bg-slate-700"
              >
                <Settings2 className="h-4 w-4" />
              </IconButton>
            </div>

            <CategoryPriceEditor
              categoryId={selectedCategory.id}
              priceRange={selectedCategory.priceRange}
            />
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
};

CategorySection.displayName = 'CategorySection';
