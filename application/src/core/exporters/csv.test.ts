import { describe, expect, it } from 'vitest'
import { toCsv } from './csv'

const parseCsv = (input: string): string[][] => {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false

  for (let index = 0; index < input.length; index++) {
    const char = input[index]

    if (quoted) {
      if (char === '"') {
        if (input[index + 1] === '"') {
          field += '"'
          index++
        } else {
          quoted = false
        }
      } else {
        field += char
      }
    } else if (char === '"') {
      quoted = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\r') {
      if (input[index + 1] === '\n') index++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows
}

describe('toCsv', () => {
  it('returns an empty string for no rows', () => {
    expect(toCsv([])).toBe('')
  })

  it('quotes only fields that need it', () => {
    expect(toCsv([{ value: 'plain' }])).toBe('value\r\nplain')
    expect(toCsv([{ value: 'a,b' }])).toBe('value\r\n"a,b"')
    expect(toCsv([{ value: 'say "hi"' }])).toBe(
      'value\r\n"say ""hi"""',
    )
    expect(toCsv([{ value: 'line one\nline two' }])).toBe(
      'value\r\n"line one\nline two"',
    )
  })

  it('uses the union of keys across sparse rows', () => {
    expect(parseCsv(toCsv([{ a: 1 }, { b: 2 }]))).toEqual([
      ['a', 'b'],
      ['1', ''],
      ['', '2'],
    ])
  })

  it('flattens product attributes into attr_ columns', () => {
    const rows = [
      {
        name: 'Acme, Inc.',
        note: 'He said "hello"',
        count: 3,
        active: true,
        missing: null,
        attributes: { color: 'red', wireless: true },
      },
      {
        name: 'Beta',
        note: 'Line one\nLine two',
        count: 4,
        active: false,
        attributes: { color: 'blue' },
      },
    ]

    expect(parseCsv(toCsv(rows))).toEqual([
      ['name', 'note', 'count', 'active', 'missing', 'attr_color', 'attr_wireless'],
      ['Acme, Inc.', 'He said "hello"', '3', 'true', '', 'red', 'true'],
      ['Beta', 'Line one\nLine two', '4', 'false', '', 'blue', ''],
    ])
  })

  it('formats nulls, booleans, and numbers', () => {
    expect(parseCsv(toCsv([{ empty: null, yes: true, no: false, count: 12 }]))).toEqual([
      ['empty', 'yes', 'no', 'count'],
      ['', 'true', 'false', '12'],
    ])
  })
})
