import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Copy,
  Database,
  FileCode2,
  FileJson,
  FileSpreadsheet,
  ListTree,
  Sparkles,
  Table2,
} from 'lucide-react';
import { roundMoney } from '../core/money';
import type { SqlDialect } from '../core/exporters/sql';
import {
  serializeDatasetAsJson,
  serializeDatasetAsSql,
  serializeRowsAsCsv,
  serializeRowsAsJson,
} from '../core/outputSerialization';
import {
  getCsvAttributeColumnNames,
  validateFieldMapping,
  type FieldMapping,
} from '../core/outputSchema';
import { useStore } from '../store/useStore';
import { downloadText } from '../lib/download';
import type { Dataset } from '../types/dataset';
import { OutputFieldsInspector } from './OutputFieldsInspector';
import { Badge, Button, IconButton, Select } from './ui';
import { cn } from './ui/cn';

export const DATASET_TABS = [
  { key: 'products', label: 'Products' },
  { key: 'customers', label: 'Customers' },
  { key: 'orders', label: 'Orders' },
  { key: 'order_lines', label: 'Order Lines' },
  { key: 'reviews', label: 'Reviews' },
] as const;

export type DatasetTab = (typeof DATASET_TABS)[number]['key'];

type OutputView = 'data' | 'fields';

const EMPTY_PRODUCTS: Dataset['products'] = [];
const EMPTY_ROWS: object[] = [];
const EMPTY_FIELD_MAPPING: FieldMapping = {};

interface OutputPanelProps {
  dataset: Dataset | null;
  categorySlug: string;
  seed: number;
  activeTab: DatasetTab;
  onTabChange: (tab: DatasetTab) => void;
  sqlDialect: SqlDialect;
  onSqlDialectChange: (dialect: SqlDialect) => void;
  isPreviewMode: boolean;
  isLoadingPreview: boolean;
  outputMapping?: FieldMapping;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  dataset,
  categorySlug,
  seed,
  activeTab,
  onTabChange,
  sqlDialect,
  onSqlDialectChange,
  isPreviewMode,
  isLoadingPreview,
  outputMapping = EMPTY_FIELD_MAPPING,
}) => {
  const selectedCategory = useStore((state) => state.selectedCategory);
  const [view, setView] = useState<OutputView>('data');
  const products = dataset?.products ?? EMPTY_PRODUCTS;
  const activeRows = dataset ? dataset[activeTab] : EMPTY_ROWS;
  const activeTabLabel =
    DATASET_TABS.find((tab) => tab.key === activeTab)?.label ?? 'Dataset';
  const activeRowsJson = useMemo(
    () => serializeRowsAsJson(activeRows, activeTab, outputMapping),
    [activeRows, activeTab, outputMapping],
  );
  const attributeKeys = useMemo(
    () => selectedCategory.attributes.map((attribute) => attribute.key),
    [selectedCategory.attributes],
  );
  const validationIssues = useMemo(
    () =>
      validateFieldMapping(outputMapping, {
        reservedNames: {
          products: getCsvAttributeColumnNames(attributeKeys),
        },
      }),
    [attributeKeys, outputMapping],
  );
  const invalidFieldCount = useMemo(
    () =>
      new Set(
        validationIssues.map((issue) => `${issue.table}:${issue.field}`),
      ).size,
    [validationIssues],
  );
  const hasValidationIssues = invalidFieldCount > 0;

  const stats = useMemo(() => {
    if (products.length === 0) return null;

    const prices = products.map((product) => product.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = roundMoney(
      prices.reduce((total, price) => total + price, 0) / prices.length,
    );

    const brandCounts = products.reduce<Record<string, number>>(
      (counts, product) => {
        counts[product.brand] = (counts[product.brand] || 0) + 1;
        return counts;
      },
      {},
    );

    return { minPrice, maxPrice, avgPrice, brandCounts };
  }, [products]);

  const copyToClipboard = () => {
    if (activeRows.length === 0) return;

    void navigator.clipboard.writeText(activeRowsJson);
  };

  const downloadCsv = () => {
    if (activeRows.length === 0) return;

    downloadText(
      serializeRowsAsCsv(activeRows, activeTab, outputMapping),
      `${categorySlug}-${activeTab}.csv`,
      'text/csv;charset=utf-8',
    );
  };

  const downloadJson = () => {
    if (!dataset) return;

    downloadText(
      serializeDatasetAsJson(dataset, outputMapping),
      `${categorySlug}-dataset.json`,
      'application/json',
    );
  };

  const downloadSql = () => {
    if (!dataset) return;

    downloadText(
      serializeDatasetAsSql(dataset, outputMapping, {
        dialect: sqlDialect,
        seed,
      }),
      `${categorySlug}-dataset-${sqlDialect}.sql`,
      'application/sql',
    );
  };

  const moveTab = (offset: number) => {
    const currentIndex = DATASET_TABS.findIndex(
      (tab) => tab.key === activeTab,
    );
    const nextIndex =
      (currentIndex + offset + DATASET_TABS.length) % DATASET_TABS.length;
    const nextTab = DATASET_TABS[nextIndex];

    onTabChange(nextTab.key);
    document.getElementById(`dataset-tab-${nextTab.key}`)?.focus();
  };

  const statusText = isLoadingPreview
    ? 'Updating Preview...'
    : products.length > 0
      ? isPreviewMode
        ? 'Live Preview (1 Sample)'
        : `${products.length} Products Generated`
      : 'Ready to Generate';

  return (
    <div className="flex-1 overflow-hidden bg-canvas p-3 sm:p-4 lg:p-6">
      <div className="flex h-full flex-col overflow-hidden border border-border bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-muted px-4 py-3 lg:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isLoadingPreview
                  ? 'animate-pulse bg-warning'
                  : products.length > 0
                    ? isPreviewMode
                      ? 'animate-pulse bg-warning'
                      : 'bg-success'
                    : 'bg-muted'
              }`}
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
              {statusText}
            </span>

            <div
              role="group"
              aria-label="Output view"
              className="flex items-center border border-border"
            >
              <Button
                size="sm"
                variant="plain"
                aria-pressed={view === 'data'}
                onClick={() => setView('data')}
                className={cn(
                  'px-2 py-1 text-[10px] uppercase tracking-wide',
                  view === 'data'
                    ? 'bg-accent text-on-accent'
                    : 'text-muted hover:bg-border hover:text-text',
                )}
              >
                <Table2 className="h-3 w-3" />
                Data
              </Button>
              <Button
                size="sm"
                variant="plain"
                aria-pressed={view === 'fields'}
                onClick={() => setView('fields')}
                className={cn(
                  'border-l border-border px-2 py-1 text-[10px] uppercase tracking-wide',
                  view === 'fields'
                    ? 'bg-accent text-on-accent'
                    : 'text-muted hover:bg-border hover:text-text',
                )}
              >
                <ListTree className="h-3 w-3" />
                Fields
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <IconButton
              label="Copy active dataset as JSON"
              onClick={copyToClipboard}
              disabled={activeRows.length === 0 || hasValidationIssues}
              className="hover:bg-border"
            >
              <Copy className="h-4 w-4" />
            </IconButton>
            <IconButton
              label="Download active dataset as CSV"
              onClick={downloadCsv}
              disabled={activeRows.length === 0 || hasValidationIssues}
              className="hover:bg-border"
            >
              <FileSpreadsheet className="h-4 w-4" />
            </IconButton>
            <IconButton
              label="Download full dataset as JSON"
              onClick={downloadJson}
              disabled={!dataset || hasValidationIssues}
              className="hover:bg-border"
            >
              <FileJson className="h-4 w-4" />
            </IconButton>
            <Select
              variant="bare"
              value={sqlDialect}
              onChange={(event) =>
                onSqlDialectChange(event.target.value as SqlDialect)
              }
              aria-label="SQL dialect"
              className="border border-border bg-surface-muted px-1.5 py-1.5 text-[10px] font-semibold uppercase text-muted"
            >
              <option value="postgres">Postgres</option>
              <option value="mysql">MySQL</option>
            </Select>
            <IconButton
              label="Download full dataset as SQL"
              onClick={downloadSql}
              disabled={!dataset || hasValidationIssues}
              className="hover:bg-border"
            >
              <FileCode2 className="h-4 w-4" />
            </IconButton>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Dataset tables"
          className="flex items-center gap-1 overflow-x-auto border-b border-border bg-surface-muted px-4 py-2 lg:px-6"
        >
          {DATASET_TABS.map((tab) => {
            const rows = dataset?.[tab.key];
            const selected = activeTab === tab.key;

            return (
              <Button
                key={tab.key}
                id={`dataset-tab-${tab.key}`}
                role="tab"
                aria-selected={selected}
                aria-controls="dataset-tab-panel"
                tabIndex={selected ? 0 : -1}
                variant="plain"
                size="sm"
                onClick={() => onTabChange(tab.key)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    moveTab(1);
                  } else if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    moveTab(-1);
                  } else if (event.key === 'Home') {
                    event.preventDefault();
                    onTabChange(DATASET_TABS[0].key);
                    document
                      .getElementById(`dataset-tab-${DATASET_TABS[0].key}`)
                      ?.focus();
                  } else if (event.key === 'End') {
                    event.preventDefault();
                    const lastTab =
                      DATASET_TABS[DATASET_TABS.length - 1];
                    onTabChange(lastTab.key);
                    document
                      .getElementById(`dataset-tab-${lastTab.key}`)
                      ?.focus();
                  }
                }}
                className={`whitespace-nowrap ${
                  selected
                    ? 'bg-accent text-on-accent'
                    : 'text-muted hover:bg-border hover:text-text'
                }`}
              >
                {tab.label}
                <Badge tone="neutral">{rows?.length ?? 0}</Badge>
              </Button>
            );
          })}
        </div>

        {hasValidationIssues && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-2 border-b border-danger/30 bg-danger-muted px-4 py-2 text-[11px] text-danger lg:px-6"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {invalidFieldCount} invalid field
              {invalidFieldCount === 1 ? ' name' : ' names'} — exports are
              disabled until fixed.
            </span>
            {view === 'data' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setView('fields')}
                className="text-danger hover:bg-danger/10 hover:text-danger"
              >
                Review fields
              </Button>
            )}
          </div>
        )}

        {stats && !isPreviewMode && view === 'data' && (
          <div className="border-b border-border bg-surface-muted px-4 py-3 lg:px-6">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted">Price Range:</span>
                <span className="font-semibold text-accent">
                  ${stats.minPrice} - ${stats.maxPrice}
                </span>
                <span className="text-muted">
                  (avg ${stats.avgPrice})
                </span>
              </div>
              <div className="hidden h-4 w-px bg-border sm:block" />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted">Brands:</span>
                {Object.entries(stats.brandCounts).map(([brand, count]) => (
                  <Badge key={brand}>
                    {brand}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        <div
          id="dataset-tab-panel"
          role="tabpanel"
          aria-labelledby={`dataset-tab-${activeTab}`}
          className="flex min-h-0 flex-1 overflow-hidden"
        >
          {view === 'fields' && (
            <OutputFieldsInspector
              table={activeTab}
              tableLabel={activeTabLabel}
              mapping={outputMapping}
              issues={validationIssues}
            />
          )}

          <div
            className={cn(
              'custom-scrollbar flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed sm:p-6 sm:text-sm lg:p-8',
              view === 'fields' && 'hidden xl:block',
            )}
          >
            {activeRows.length > 0 ? (
              <div className="relative">
                {isPreviewMode && activeTab === 'products' && (
                  <Badge
                    tone="warning"
                    className="absolute -left-2 -top-2 gap-1.5 border border-warning/50 px-3 py-1 uppercase tracking-wider"
                  >
                    <Sparkles className="h-3 w-3" />
                    Live Preview
                  </Badge>
                )}
                <pre
                  className={`whitespace-pre-wrap ${
                    isPreviewMode ? 'text-warning' : 'text-success'
                  }`}
                >
                  {activeRowsJson}
                </pre>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center space-y-4 text-muted">
                <Database className="h-12 w-12 opacity-10" />
                <div className="text-center">
                  <p className="mb-2 text-sm font-medium uppercase tracking-widest opacity-40">
                    {dataset
                      ? `No ${activeTabLabel} Data`
                      : 'Select Brands to Preview'}
                  </p>
                  <p className="max-w-xs text-xs text-muted">
                    {dataset
                      ? 'Generate a full dataset to populate this tab.'
                      : 'Select brands in the sidebar to see a live preview of your product configuration'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

OutputPanel.displayName = 'OutputPanel';
