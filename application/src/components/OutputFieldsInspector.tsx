import React, { useMemo } from 'react';
import { AlertTriangle, Lock, RotateCcw } from 'lucide-react';
import {
  FIXED_FIELDS,
  RENAMEABLE_FIELDS,
  getEffectiveFieldName,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  type DatasetTable,
  type FieldMapping,
  type FieldMappingIssue,
} from '../core/outputSchema';
import { useStore } from '../store/useStore';
import { Badge, Button, IconButton, Input } from './ui';

interface OutputFieldsInspectorProps {
  table: DatasetTable;
  tableLabel: string;
  mapping: FieldMapping;
  issues: readonly FieldMappingIssue[];
}

const NAMING_ACTIONS = [
  { label: 'snake_case', convert: toSnakeCase },
  { label: 'camelCase', convert: toCamelCase },
  { label: 'PascalCase', convert: toPascalCase },
] as const;

export const OutputFieldsInspector: React.FC<OutputFieldsInspectorProps> = ({
  table,
  tableLabel,
  mapping,
  issues,
}) => {
  const setFieldName = useStore((state) => state.setFieldName);
  const resetFieldName = useStore((state) => state.resetFieldName);
  const resetTableMapping = useStore((state) => state.resetTableMapping);
  const resetOutputMapping = useStore((state) => state.resetOutputMapping);

  const tableOverrides = mapping[table] ?? {};
  const hasTableOverrides = Object.keys(tableOverrides).length > 0;
  const hasAnyOverrides = Object.keys(mapping).length > 0;
  const fields = RENAMEABLE_FIELDS[table];
  const fixedFields = FIXED_FIELDS[table];

  const issueMessages = useMemo(() => {
    const messages = new Map<string, string[]>();

    for (const issue of issues) {
      if (issue.table !== table) continue;

      const fieldMessages = messages.get(issue.field) ?? [];

      if (!fieldMessages.includes(issue.message)) {
        fieldMessages.push(issue.message);
        messages.set(issue.field, fieldMessages);
      }
    }

    return messages;
  }, [issues, table]);

  const applyNaming = (convert: (value: string) => string) => {
    for (const field of fields) {
      setFieldName(table, field, convert(field));
    }
  };

  return (
    <aside
      aria-label={`${tableLabel} output fields`}
      className="flex w-full shrink-0 flex-col overflow-hidden border-border bg-surface xl:w-[22rem] xl:border-r"
    >
      <div className="shrink-0 border-b border-border px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text">
              Output Fields
            </h2>
            <p className="mt-1 text-[11px] text-muted">
              {tableLabel} · {fields.length} editable
              {fixedFields.length > 0
                ? ` · ${fixedFields.length} fixed`
                : ''}
            </p>
          </div>
          <Badge tone={issueMessages.size > 0 ? 'danger' : 'neutral'}>
            {issueMessages.size > 0
              ? `${issueMessages.size} issue${issueMessages.size === 1 ? '' : 's'}`
              : 'No issues'}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => resetTableMapping(table)}
            disabled={!hasTableOverrides}
          >
            Reset table
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={resetOutputMapping}
            disabled={!hasAnyOverrides}
          >
            Reset all
          </Button>
        </div>

        <div className="mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
            Bulk naming
          </p>
          <div
            role="group"
            aria-label={`Apply naming style to ${tableLabel}`}
            className="mt-1.5 flex flex-wrap gap-1.5"
          >
            <Button
              size="sm"
              variant="secondary"
              onClick={() => resetTableMapping(table)}
              disabled={!hasTableOverrides}
            >
              Canonical
            </Button>
            {NAMING_ACTIONS.map((action) => (
              <Button
                key={action.label}
                size="sm"
                variant="secondary"
                onClick={() => applyNaming(action.convert)}
              >
                {action.label}
              </Button>
            ))}
          </div>
          <p className="mt-1.5 text-[10px] leading-relaxed text-muted">
            Writes explicit names for this table&apos;s top-level fields.
            Attributes keep their keys.
          </p>
        </div>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 space-y-2.5 overflow-y-auto p-4">
        {fields.map((field) => {
          const hasOverride = Object.prototype.hasOwnProperty.call(
            tableOverrides,
            field,
          );
          const value = getEffectiveFieldName(table, field, mapping);
          const error = issueMessages.get(field)?.join(' ');
          const inputId = `output-field-${table}-${field}`;

          return (
            <div key={field} className="border border-border bg-surface p-2.5">
              <label
                htmlFor={inputId}
                className="mb-1.5 block font-mono text-[11px] text-text"
              >
                {field}
              </label>
              <div className="flex items-center gap-1">
                <Input
                  id={inputId}
                  variant="default"
                  value={value}
                  invalid={Boolean(error)}
                  autoComplete="off"
                  spellCheck={false}
                  aria-describedby={error ? `${inputId}-error` : undefined}
                  onChange={(event) =>
                    setFieldName(table, field, event.target.value)
                  }
                  className="min-w-0 flex-1 px-2 py-1.5 font-mono text-xs"
                />
                <IconButton
                  label={`Reset ${field} output name`}
                  onClick={() => resetFieldName(table, field)}
                  disabled={!hasOverride}
                  className="border border-border bg-surface"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </IconButton>
              </div>
              {error && (
                <p
                  id={`${inputId}-error`}
                  role="alert"
                  className="mt-1.5 text-[11px] leading-relaxed text-danger"
                >
                  {error}
                </p>
              )}
            </div>
          );
        })}

        {fixedFields.length > 0 && (
          <div className="space-y-2 border-t border-border pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
              Fixed
            </p>
            {fixedFields.map((field) => (
              <div
                key={field}
                className="flex items-center justify-between gap-2 border border-border bg-surface-muted px-2.5 py-2"
              >
                <span className="font-mono text-[11px] text-muted">
                  {field}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  <Lock className="h-3 w-3" />
                  Fixed
                </span>
              </div>
            ))}
          </div>
        )}

        {issueMessages.size > 0 && (
          <div
            role="alert"
            className="flex items-start gap-2 border border-danger/40 bg-danger-muted px-2.5 py-2 text-[11px] leading-relaxed text-danger"
          >
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>Fix highlighted names before exporting this dataset.</span>
          </div>
        )}
      </div>
    </aside>
  );
};

OutputFieldsInspector.displayName = 'OutputFieldsInspector';
