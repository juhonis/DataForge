const escapeField = (value: string): string =>
  /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '';
  }
  if (typeof value === 'string') return escapeField(value);

  return escapeField(JSON.stringify(value) ?? '');
};

const normalizeRow = (row: object): Record<string, unknown> => {
  const { attributes, ...rest } = row as Record<string, unknown>;

  if (!attributes) return rest;

  if (typeof attributes === 'object' && !Array.isArray(attributes)) {
    for (const [key, value] of Object.entries(attributes)) {
      rest[`attr_${key}`] = value;
    }

    return rest;
  }

  return { ...rest, attributes };
};

export const toCsv = (rows: readonly object[]): string => {
  const normalizedRows = rows.map(normalizeRow);
  const columns = [
    ...new Set(normalizedRows.flatMap((row) => Object.keys(row))),
  ];

  if (columns.length === 0) return '';

  const header = columns.map(escapeField).join(',');
  const body = normalizedRows.map((row) =>
    columns.map((column) => formatValue(row[column])).join(','),
  );

  return [header, ...body].join('\r\n');
};
