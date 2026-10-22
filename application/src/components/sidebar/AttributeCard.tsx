import React, { useState } from 'react';
import {
  Check,
  Edit3,
  Hash,
  List,
  Plus,
  Save,
  Trash2,
  Type,
  X,
} from 'lucide-react';
import { normalizeAttributeKey } from '../../core/normalize';
import { useStore } from '../../store/useStore';
import type { AttributeDefinition } from '../../types/product';
import {
  Badge,
  Button,
  Field,
  IconButton,
  Input,
  NumberInput,
} from '../ui';

const ATTRIBUTE_TYPES = [
  { value: 'select', label: 'Select', icon: List },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'boolean', label: 'Yes/No', icon: Check },
  { value: 'text', label: 'Text', icon: Type },
] as const;

interface AttributeCardProps {
  categoryId: string;
  attribute: AttributeDefinition;
}

export const AttributeCard: React.FC<AttributeCardProps> = ({
  categoryId,
  attribute,
}) => {
  const updateAttribute = useStore((state) => state.updateAttribute);
  const removeAttribute = useStore((state) => state.removeAttribute);
  const addAttributeOption = useStore((state) => state.addAttributeOption);
  const removeAttributeOption = useStore(
    (state) => state.removeAttributeOption,
  );

  const [editing, setEditing] = useState(false);
  const [key, setKey] = useState(attribute.key);
  const [type, setType] = useState<AttributeDefinition['type']>(
    attribute.type,
  );
  const [min, setMin] = useState(attribute.min ?? 0);
  const [max, setMax] = useState(attribute.max ?? 100);
  const [newOption, setNewOption] = useState('');

  const startEditing = () => {
    setKey(attribute.key);
    setType(attribute.type);
    setMin(attribute.min ?? 0);
    setMax(attribute.max ?? 100);
    setNewOption('');
    setEditing(true);
  };

  const cancelEditing = () => {
    setNewOption('');
    setEditing(false);
  };

  const save = () => {
    const updates: Partial<AttributeDefinition> = { type };

    if (type === 'number') {
      updates.min = min;
      updates.max = max;
    }

    const nextKey = normalizeAttributeKey(key);

    if (nextKey && nextKey !== attribute.key) {
      updates.key = nextKey;
    }

    updateAttribute(categoryId, attribute.key, updates);
    setEditing(false);
  };

  const addOption = () => {
    const option = newOption.trim();

    if (!option) return;

    addAttributeOption(categoryId, attribute.key, option);
    setNewOption('');
  };

  return (
    <div className="border border-border bg-surface-muted p-3 transition-colors hover:border-muted">
      {editing ? (
        <div className="space-y-3">
          <Field label="Key" htmlFor={`attribute-key-${attribute.key}`}>
            <Input
              id={`attribute-key-${attribute.key}`}
              value={key}
              onChange={(event) => setKey(event.target.value)}
            />
          </Field>

          <div>
            <span className="mb-1 block text-[10px] font-semibold uppercase text-muted">
              Type
            </span>
            <div
              role="group"
              aria-label="Attribute type"
              className="grid grid-cols-2 gap-2"
            >
              {ATTRIBUTE_TYPES.map((option) => (
                <Button
                  key={option.value}
                  variant={type === option.value ? 'primary' : 'secondary'}
                  size="sm"
                  aria-pressed={type === option.value}
                  onClick={() => setType(option.value)}
                  className="justify-start"
                >
                  <option.icon className="h-3 w-3" />
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {type === 'number' && (
            <div className="flex gap-2">
              <Field
                label="Min"
                htmlFor={`attribute-min-${attribute.key}`}
                className="flex-1"
              >
                <NumberInput
                  id={`attribute-min-${attribute.key}`}
                  integer
                  value={min}
                  onValueChange={setMin}
                />
              </Field>
              <Field
                label="Max"
                htmlFor={`attribute-max-${attribute.key}`}
                className="flex-1"
              >
                <NumberInput
                  id={`attribute-max-${attribute.key}`}
                  integer
                  value={max}
                  onValueChange={setMax}
                />
              </Field>
            </div>
          )}

          {(type === 'select' || attribute.type === 'select') && (
            <div>
              <span className="mb-1 block text-[10px] font-semibold uppercase text-muted">
                Options
              </span>
              <div className="mb-2 flex flex-wrap gap-1">
                {attribute.options?.map((option) => (
                  <span
                    key={String(option)}
                    className="inline-flex items-center gap-1 bg-surface px-2 py-1 text-xs text-text"
                  >
                    {String(option)}
                    <IconButton
                      variant="plain"
                      label={`Remove option ${String(option)} from ${attribute.key}`}
                      onClick={() =>
                        removeAttributeOption(
                          categoryId,
                          attribute.key,
                          String(option),
                        )
                      }
                      className="p-0 text-muted hover:text-danger"
                    >
                      <X className="h-3 w-3" />
                    </IconButton>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newOption}
                  onChange={(event) => setNewOption(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') addOption();
                  }}
                  placeholder="Add option..."
                  aria-label={`New option for ${attribute.key}`}
                  className="min-w-0 flex-1"
                />
                <IconButton
                  variant="plain"
                  label={`Add option to ${attribute.key}`}
                  onClick={addOption}
                  disabled={!newOption.trim()}
                  className="bg-surface text-text hover:bg-border"
                >
                  <Plus className="h-4 w-4" />
                </IconButton>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
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
              onClick={cancelEditing}
              className="flex-1"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold capitalize text-text">
                {attribute.key}
              </div>
              <Badge className="mt-1">{attribute.type}</Badge>
            </div>
            <div className="flex gap-1">
              <IconButton
                label={`Edit attribute ${attribute.key}`}
                onClick={startEditing}
                className="hover:bg-border"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </IconButton>
              <IconButton
                variant="danger"
                label={`Delete attribute ${attribute.key}`}
                onClick={() => removeAttribute(categoryId, attribute.key)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </IconButton>
            </div>
          </div>

          {attribute.type === 'select' &&
            attribute.options &&
            attribute.options.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {attribute.options.map((option) => (
                  <Badge key={String(option)} tone="accent">
                    {String(option)}
                  </Badge>
                ))}
              </div>
            )}

          {attribute.type === 'number' && (
            <div className="text-[10px] text-muted">
              Range: {attribute.min ?? 0} - {attribute.max ?? 100}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

AttributeCard.displayName = 'AttributeCard';
