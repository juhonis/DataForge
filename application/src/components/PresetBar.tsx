import React, { useRef, useState } from 'react';
import { Copy, Download, Layers, Upload } from 'lucide-react';
import { BUNDLED_PRESETS } from '../core/builtInPresets';
import { CATEGORY_TEMPLATES } from '../core/categories';
import {
  createPreset,
  parsePreset,
  serializePreset,
} from '../core/presets';
import { downloadText } from '../lib/download';
import { useStore } from '../store/useStore';
import { Button, IconButton, Select } from './ui';

interface PresetBarProps {
  onPresetApplied: () => void;
}

type Notice = {
  tone: 'success' | 'error';
  text: string;
} | null;

export const PresetBar: React.FC<PresetBarProps> = ({ onPresetApplied }) => {
  const categories = useStore((state) => state.categories);
  const selectedCategory = useStore((state) => state.selectedCategory);
  const brands = useStore((state) => state.brands);
  const selectedBrands = useStore((state) => state.selectedBrands);
  const settings = useStore((state) => state.settings);
  const setSelectedCategory = useStore((state) => state.setSelectedCategory);
  const addCategory = useStore((state) => state.addCategory);
  const updateSettings = useStore((state) => state.updateSettings);
  const applyPreset = useStore((state) => state.applyPreset);

  const [presetId, setPresetId] = useState(BUNDLED_PRESETS[0].id);
  const [notice, setNotice] = useState<Notice>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPreset = () =>
    createPreset({
      category: selectedCategory,
      brands,
      selectedBrands,
      settings,
    });

  const handleLoadBundled = () => {
    const bundled = BUNDLED_PRESETS.find((preset) => preset.id === presetId);

    if (!bundled) return;

    const storedCategory = categories.find(
      (category) => category.id === bundled.categoryId,
    );
    const category =
      storedCategory ??
      CATEGORY_TEMPLATES.find((item) => item.id === bundled.categoryId);

    if (!category) {
      setNotice({ tone: 'error', text: 'Bundled category not found.' });
      return;
    }

    if (!storedCategory) addCategory(category);

    setSelectedCategory(category);
    updateSettings(bundled.settings);
    onPresetApplied();
    setNotice({ tone: 'success', text: `Loaded ${bundled.name}.` });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        serializePreset(currentPreset()),
      );
      setNotice({ tone: 'success', text: 'Preset copied to clipboard.' });
    } catch {
      setNotice({ tone: 'error', text: 'Could not copy preset.' });
    }
  };

  const handleExport = () => {
    downloadText(
      serializePreset(currentPreset()),
      `${selectedCategory.slug}.dataforge.json`,
      'application/json',
    );
    setNotice({ tone: 'success', text: 'Preset exported.' });
  };

  const handleImport = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    try {
      const preset = parsePreset(await file.text());

      applyPreset(preset);
      onPresetApplied();
      setNotice({
        tone: 'success',
        text: `Loaded ${preset.category.name} preset.`,
      });
    } catch (error) {
      setNotice({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Could not import preset.',
      });
    }
  };

  return (
    <div className="shrink-0 border-b border-border bg-surface px-3 py-2">
      <div className="flex items-center gap-2">
        <Layers
          className="h-4 w-4 shrink-0 text-muted"
          aria-hidden
        />

        <Select
          variant="bare"
          value={presetId}
          onChange={(event) => setPresetId(event.target.value)}
          aria-label="Bundled preset"
          className="min-w-0 flex-1 border border-border bg-surface-muted px-2 py-1.5 text-xs text-text"
        >
          {BUNDLED_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
        </Select>

        <Button
          variant="primary"
          size="sm"
          onClick={handleLoadBundled}
          className="shrink-0"
        >
          Load
        </Button>

        <div className="flex shrink-0 items-center gap-0.5">
          <IconButton
            label="Copy preset to clipboard"
            onClick={() => void handleCopy()}
          >
            <Copy className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton
            label="Import preset"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton label="Export preset" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" />
          </IconButton>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={(event) => void handleImport(event)}
          className="hidden"
          aria-label="Import preset file"
        />
      </div>

      {notice && (
        <span
          role="status"
          aria-live="polite"
          className={`mt-1.5 block text-xs ${
            notice.tone === 'error' ? 'text-danger' : 'text-success'
          }`}
        >
          {notice.text}
        </span>
      )}
    </div>
  );
};
