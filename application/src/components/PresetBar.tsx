import React, { useRef, useState } from 'react';
import { Copy, Dices, Download, Layers, Upload } from 'lucide-react';
import { BUNDLED_PRESETS } from '../core/builtInPresets';
import { CATEGORY_TEMPLATES } from '../core/categories';
import {
  createPreset,
  parsePreset,
  serializePreset,
} from '../core/presets';
import { downloadText } from '../lib/download';
import { useStore } from '../store/useStore';
import {
  Button,
  IconButton,
  NumberInput,
  Select,
} from './ui';

interface PresetBarProps {
  onPresetApplied: () => void;
}

type Notice = {
  tone: 'success' | 'error';
  text: string;
} | null;

const MAX_SEED = 1_000_000_000;

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

  const updateSeed = (seed: number) => {
    updateSettings({ seed });
  };

  const randomizeSeed = () => {
    const values = new Uint32Array(1);

    crypto.getRandomValues(values);
    updateSettings({ seed: values[0] % MAX_SEED });
  };

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 lg:px-6 py-2 border-b border-slate-800 bg-slate-900/30 shrink-0">
      <div className="flex items-center gap-1.5 text-slate-500">
        <Layers className="w-4 h-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
          Presets
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Select
          variant="bare"
          value={presetId}
          onChange={(event) => setPresetId(event.target.value)}
          aria-label="Bundled preset"
          className="max-w-[180px] rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs text-slate-300"
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
        >
          Load
        </Button>
      </div>

      <div className="h-5 w-px bg-slate-800 hidden sm:block" />

      <div className="flex items-center gap-1.5">
        <label
          htmlFor="preset-seed"
          className="text-[10px] font-bold uppercase text-slate-500"
        >
          Seed
        </label>
        <NumberInput
          id="preset-seed"
          variant="bare"
          min={0}
          max={MAX_SEED}
          integer
          value={settings.seed}
          onValueChange={updateSeed}
          className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm font-bold text-indigo-400 text-center outline-none"
        />
        <IconButton label="Randomize seed" onClick={randomizeSeed}>
          <Dices className="h-4 w-4" />
        </IconButton>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void handleCopy()}
          aria-label="Copy preset to clipboard"
        >
          <Copy className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Copy</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Import preset"
        >
          <Upload className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Import</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExport}
          aria-label="Export preset"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Export</span>
        </Button>
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
          className={`w-full lg:w-auto text-xs ${
            notice.tone === 'error' ? 'text-red-400' : 'text-emerald-400'
          }`}
        >
          {notice.text}
        </span>
      )}
    </div>
  );
};
