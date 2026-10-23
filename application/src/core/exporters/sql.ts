export type SqlDialect = 'postgres' | 'mysql';

export interface SqlOptions {
  dialect?: SqlDialect;
}

export interface DatasetSqlOptions extends SqlOptions {
  seed?: number | string;
  configSummary?: string;
}

export interface DatasetTables {
  readonly products: readonly object[];
  readonly customers: readonly object[];
  readonly orders: readonly object[];
  readonly order_lines: readonly object[];
  readonly reviews: readonly object[];
}

const quoteIdentifier = (identifier: string, dialect: SqlDialect): string => {
  const quote = dialect === 'mysql' ? '`' : '"';

  return `${quote}${identifier.replaceAll(quote, quote + quote)}${quote}`;
};

const quoteString = (value: string): string =>
  `'${value.replace(/'/g, "''")}'`;

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'NULL';
  }
  if (typeof value === 'string') return quoteString(value);

  return quoteString(JSON.stringify(value) ?? '');
};

const normalizeRow = (row: object): Record<string, unknown> =>
  row as Record<string, unknown>;

export const toSqlInsert = (
  table: string,
  rows: readonly object[],
  options: SqlOptions = {},
): string => {
  const dialect = options.dialect ?? 'postgres';
  const normalizedRows = rows.map(normalizeRow);
  const columns = [
    ...new Set(normalizedRows.flatMap((row) => Object.keys(row))),
  ];

  if (columns.length === 0) return '';

  const tableName = quoteIdentifier(table, dialect);
  const columnList = columns
    .map((column) => quoteIdentifier(column, dialect))
    .join(', ');

  return normalizedRows
    .map((row) => {
      const values = columns
        .map((column) => formatValue(row[column]))
        .join(', ');

      return `INSERT INTO ${tableName} (${columnList}) VALUES (${values});`;
    })
    .join('\n');
};

export const datasetToSql = (
  dataset: DatasetTables,
  options: DatasetSqlOptions = {},
): string => {
  const summary =
    options.configSummary ??
    [
      `${dataset.products.length} products`,
      `${dataset.customers.length} customers`,
      `${dataset.orders.length} orders`,
      `${dataset.order_lines.length} order lines`,
      `${dataset.reviews.length} reviews`,
    ].join(', ');

  const header = [
    '-- DataForge',
    `-- Seed: ${options.seed ?? 'n/a'}`,
    `-- Config: ${summary}`,
  ].join('\n');

  const tables: ReadonlyArray<readonly [string, readonly object[]]> = [
    ['products', dataset.products],
    ['customers', dataset.customers],
    ['orders', dataset.orders],
    ['order_lines', dataset.order_lines],
    ['reviews', dataset.reviews],
  ];

  const statements = tables
    .map(([table, rows]) => toSqlInsert(table, rows, options))
    .filter((statement) => statement !== '');

  return [header, ...statements].join('\n\n');
};
