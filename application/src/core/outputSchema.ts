import type { Dataset } from '../types/dataset';

export const DATASET_TABLES = [
  'products',
  'customers',
  'orders',
  'order_lines',
  'reviews',
] as const;

export type DatasetTable = (typeof DATASET_TABLES)[number];

export const RENAMEABLE_FIELDS = {
  products: [
    'id',
    'brand',
    'name',
    'description',
    'slug',
    'price',
    'stock_quantity',
    'category',
    'sku',
    'weight_kg',
    'length_cm',
    'width_cm',
    'height_cm',
    'images',
  ],
  customers: [
    'id',
    'name',
    'email',
    'phone',
    'city',
    'country',
    'created_at',
  ],
  orders: [
    'id',
    'customer_id',
    'status',
    'placed_at',
    'total',
    'currency',
  ],
  order_lines: [
    'id',
    'order_id',
    'product_id',
    'quantity',
    'unit_price',
    'line_total',
  ],
  reviews: [
    'id',
    'product_id',
    'customer_id',
    'rating',
    'title',
    'body',
    'created_at',
  ],
} as const satisfies Record<DatasetTable, readonly string[]>;

export const FIXED_FIELDS = {
  products: ['attributes'],
  customers: [],
  orders: [],
  order_lines: [],
  reviews: [],
} as const satisfies Record<DatasetTable, readonly string[]>;

export type FieldMapping = Partial<
  Record<DatasetTable, Record<string, string>>
>;

export type MappedRow = Record<string, unknown>;
export type MappedDataset = Record<DatasetTable, MappedRow[]>;

export interface FieldMappingIssue {
  table: DatasetTable;
  field: string;
  value: string;
  message: string;
}

export interface FieldMappingValidationOptions {
  reservedNames?: Partial<Record<DatasetTable, readonly string[]>>;
}

export const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export const getCsvAttributeColumnNames = (
  attributeKeys: readonly string[],
): string[] => attributeKeys.map((key) => `attr_${key}`);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isDatasetTable = (value: string): value is DatasetTable =>
  (DATASET_TABLES as readonly string[]).includes(value);

export const isRenameableField = (
  table: DatasetTable,
  field: string,
): boolean => (RENAMEABLE_FIELDS[table] as readonly string[]).includes(field);

const isFixedField = (table: DatasetTable, field: string): boolean =>
  (FIXED_FIELDS[table] as readonly string[]).includes(field);

export const isFieldMapping = (value: unknown): value is FieldMapping => {
  if (!isRecord(value)) return false;

  return Object.entries(value).every(
    ([table, fields]) =>
      isDatasetTable(table) &&
      isRecord(fields) &&
      Object.values(fields).every(
        (fieldName) => typeof fieldName === 'string',
      ),
  );
};

export const getEffectiveFieldName = (
  table: DatasetTable,
  field: string,
  mapping: FieldMapping,
): string => {
  if (!isRenameableField(table, field)) return field;

  return mapping[table]?.[field] ?? field;
};

export const applyFieldMapping = (
  rows: readonly object[],
  table: DatasetTable,
  mapping: FieldMapping,
): MappedRow[] =>
  rows.map((row) => {
    const mapped: MappedRow = {};

    for (const [field, value] of Object.entries(row)) {
      mapped[getEffectiveFieldName(table, field, mapping)] = value;
    }

    return mapped;
  });

export const applyDatasetFieldMapping = (
  dataset: Dataset,
  mapping: FieldMapping,
): MappedDataset => ({
  products: applyFieldMapping(dataset.products, 'products', mapping),
  customers: applyFieldMapping(dataset.customers, 'customers', mapping),
  orders: applyFieldMapping(dataset.orders, 'orders', mapping),
  order_lines: applyFieldMapping(dataset.order_lines, 'order_lines', mapping),
  reviews: applyFieldMapping(dataset.reviews, 'reviews', mapping),
});

export const validateFieldMapping = (
  mapping: FieldMapping,
  options: FieldMappingValidationOptions = {},
): FieldMappingIssue[] => {
  const issues: FieldMappingIssue[] = [];

  for (const table of DATASET_TABLES) {
    const overrides = mapping[table] ?? {};
    const reservedNames = new Set(
      [
        ...FIXED_FIELDS[table],
        ...(options.reservedNames?.[table] ?? []),
      ].map((name) => name.toLowerCase()),
    );
    const finalNames: Array<{ field: string; value: string }> = [];

    for (const field of RENAMEABLE_FIELDS[table]) {
      const hasOverride = Object.prototype.hasOwnProperty.call(
        overrides,
        field,
      );
      const value = hasOverride ? overrides[field] : field;

      if (hasOverride) {
        if (value.trim().length === 0) {
          issues.push({
            table,
            field,
            value,
            message: `Field "${field}" cannot be blank.`,
          });
        } else if (!IDENTIFIER_PATTERN.test(value)) {
          issues.push({
            table,
            field,
            value,
            message: `Field "${field}" must be a valid identifier.`,
          });
        }
      }

      if (reservedNames.has(value.toLowerCase())) {
        issues.push({
          table,
          field,
          value,
          message: `Field "${field}" uses reserved name "${value}".`,
        });
      }

      finalNames.push({ field, value });
    }

    for (const [field, value] of Object.entries(overrides)) {
      if (!isRenameableField(table, field)) {
        issues.push({
          table,
          field,
          value,
          message: isFixedField(table, field)
            ? `Field "${field}" is not renameable.`
            : `Unknown field "${field}" in ${table}.`,
        });
      }
    }

    const groupedNames = new Map<
      string,
      Array<{ field: string; value: string }>
    >();

    for (const entry of finalNames) {
      const key = entry.value.toLowerCase();
      const group = groupedNames.get(key) ?? [];

      group.push(entry);
      groupedNames.set(key, group);
    }

    for (const group of groupedNames.values()) {
      if (group.length < 2) continue;

      for (const entry of group) {
        issues.push({
          table,
          field: entry.field,
          value: entry.value,
          message: `Field "${entry.field}" produces duplicate name "${entry.value}".`,
        });
      }
    }
  }

  return issues;
};

const splitWords = (value: string): string[] => {
  const normalized = value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return normalized === ''
    ? []
    : normalized.split('_').map((word) => word.toLowerCase());
};

const capitalize = (word: string): string =>
  `${word.charAt(0).toUpperCase()}${word.slice(1)}`;

export const toSnakeCase = (value: string): string =>
  splitWords(value).join('_');

export const toCamelCase = (value: string): string => {
  const [first, ...rest] = splitWords(value);

  return first === undefined
    ? ''
    : `${first}${rest.map(capitalize).join('')}`;
};

export const toPascalCase = (value: string): string =>
  splitWords(value).map(capitalize).join('');
