import React, { useState } from 'react';
import { Layers, Plus, Save, X } from 'lucide-react';
import { normalizeAttributeKey } from '../../core/normalize';
import { useStore } from '../../store/useStore';
import type { AttributeDefinition } from '../../types/product';
import {
  Badge,
  Button,
  CollapsibleSection,
  Field,
  Input,
} from '../ui';
import { AttributeCard } from './AttributeCard';

interface AttributeSectionProps {
  expanded: boolean;
  onToggle: () => void;
}

export const AttributeSection: React.FC<AttributeSectionProps> = ({
  expanded,
  onToggle,
}) => {
  const selectedCategory = useStore((state) => state.selectedCategory);
  const addAttribute = useStore((state) => state.addAttribute);

  const [adding, setAdding] = useState(false);
  const [newKey, setNewKey] = useState('');

  const closeForm = () => {
    setAdding(false);
    setNewKey('');
  };

  const add = () => {
    const key = normalizeAttributeKey(newKey);

    if (!key) return;

    const attribute: AttributeDefinition = {
      key,
      type: 'select',
      options: [],
    };

    addAttribute(selectedCategory.id, attribute);
    closeForm();
  };

  return (
    <CollapsibleSection
      id="attributes"
      title="Attributes"
      icon={<Layers className="h-3 w-3" />}
      badge={<Badge>{selectedCategory.attributes.length}</Badge>}
      expanded={expanded}
      onToggle={onToggle}
    >
      <div className="space-y-3">
        {adding ? (
          <div className="space-y-2 border border-border bg-surface-muted p-3">
            <Field label="Attribute Key" htmlFor="new-attribute-key">
              <Input
                id="new-attribute-key"
                value={newKey}
                onChange={(event) => setNewKey(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') add();
                  if (event.key === 'Escape') closeForm();
                }}
                placeholder="e.g., color"
              />
            </Field>
            <div className="flex gap-2">
              <Button
                variant="success"
                size="sm"
                onClick={add}
                disabled={!newKey.trim()}
                className="flex-1"
              >
                <Save className="h-4 w-4" />
                Add
              </Button>
              <Button
                size="sm"
                onClick={closeForm}
                className="flex-1"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="plain"
            onClick={() => setAdding(true)}
            className="w-full border border-dashed border-border bg-surface text-muted hover:bg-surface-muted hover:text-text"
          >
            <Plus className="h-4 w-4" />
            Add Attribute
          </Button>
        )}

        <div className="space-y-2">
          {selectedCategory.attributes.map((attribute) => (
            <AttributeCard
              key={attribute.key}
              categoryId={selectedCategory.id}
              attribute={attribute}
            />
          ))}
        </div>
      </div>
    </CollapsibleSection>
  );
};

AttributeSection.displayName = 'AttributeSection';
