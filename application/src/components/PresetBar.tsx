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

interface PresetBarProps {
  onPresetApplied: () => void;
}

type Notice = {
  tone: 'success' | 'error';
  text: string;
} | null;

const MAX_SEED = 1_000_000_000;

const clampSeed = (value: string, fallback: number): number => {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) return fallback;

  return Math.min(MAX_SEED, Math.max(0, parsed));
};

export const PresetBar: React.FC<PresetBarProps> = ({ onPresetApplied }) => {
  const {
    categories,
    selectedCategory,
    brands,
    selectedBrands,
    settings,
    setSelectedCategory,
    addCategory,
    updateSettings,
    applyPreset,
  } = useStore();

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

  const updateSeed = (value: string) => {
    updateSettings({ seed: clampSeed(value, settings.seed) });
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
        <select
          value={presetId}
          onChange={(event) => setPresetId(event.target.value)}
          aria-label="Bundled preset"
          className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 px-2 py-1.5 outline-none max-w-[180px]"
        >
          {BUNDLED_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleLoadBundled}
          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
        >
          Load
        </button>
      </div>

      <div className="h-5 w-px bg-slate-800 hidden sm:block" />

      <div className="flex items-center gap-1.5">
        <label
          htmlFor="preset-seed"
          className="text-[10px] font-bold uppercase text-slate-500"
        >
          Seed
        </label>
        <input
          id="preset-seed"
          type="number"
          min={0}
          max={MAX_SEED}
          value={settings.seed}
          onChange={(event) => updateSeed(event.target.value)}
          className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm font-bold text-indigo-400 text-center outline-none"
        />
        <button
          type="button"
          onClick={randomizeSeed}
          title="Randomize seed"
          aria-label="Randomize seed"
          className="p-1 text-slate-500 hover:text-indigo-400 transition-colors"
        >
          <Dices className="w-4 h-4" />
        </button>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={() => void handleCopy()}
          title="Copy preset to clipboard"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Copy</span>
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Import preset"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Import</span>
        </button>
        <button
          type="button"
          onClick={handleExport}
          title="Export preset"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Export</span>
        </button>
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
