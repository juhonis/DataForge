import type { Dataset } from '../types/dataset';
import { toCsv } from './exporters/csv';
import { toJson } from './exporters/json';
import {
  datasetToSql,
  type DatasetSqlOptions,
} from './exporters/sql';
import {
  applyDatasetFieldMapping,
  applyFieldMapping,
  type DatasetTable,
  type FieldMapping,
} from './outputSchema';

export const serializeRowsAsJson = (
  rows: readonly object[],
  table: DatasetTable,
  mapping: FieldMapping,
): string => toJson(applyFieldMapping(rows, table, mapping));

export const serializeRowsAsCsv = (
  rows: readonly object[],
  table: DatasetTable,
  mapping: FieldMapping,
): string => toCsv(applyFieldMapping(rows, table, mapping));

export const serializeDatasetAsJson = (
  dataset: Dataset,
  mapping: FieldMapping,
): string => toJson(applyDatasetFieldMapping(dataset, mapping));

export const serializeDatasetAsSql = (
  dataset: Dataset,
  mapping: FieldMapping,
  options: DatasetSqlOptions = {},
): string =>
  datasetToSql(applyDatasetFieldMapping(dataset, mapping), options);
