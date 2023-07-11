import chalk from 'chalk'
import { cli, Table } from 'cli-ux'

type NameValueObj = { name: string; value: string }

export function displayHeader(caption: string, placeholderSign = '_', size = 50): void {
  const singsPerSide: number = Math.floor((size - (caption.length + 2)) / 2)
  let finalStr = ''
  for (let i = 0; i < singsPerSide; ++i) finalStr += placeholderSign
  finalStr += ` ${caption} `
  while (finalStr.length < size) finalStr += placeholderSign

  process.stdout.write('\n' + chalk.bold.blueBright(finalStr) + '\n\n')
}

export function displayNameValueTable(rows: NameValueObj[]): void {
  cli.table(
    rows,
    {
      name: { minWidth: 30, get: (row) => chalk.bold.magentaBright(row.name) },
      value: { get: (row) => chalk.magentaBright(row.value) },
    },
    { 'no-header': true }
  )
}

export function displayCollapsedRow(row: { [k: string]: string | number }): void {
  const collapsedRow: NameValueObj[] = Object.keys(row).map((name) => ({
    name,
    value: typeof row[name] === 'string' ? (row[name] as string) : row[name].toString(),
  }))

  displayNameValueTable(collapsedRow)
}

export function displayTable(rows: { [k: string]: string | number }[], cellHorizontalPadding = 0): void {
  if (!rows.length) {
    return
  }
  const maxLength = (columnName: string) =>
    rows.reduce((maxLength, row) => {
      const val = row[columnName]
      const valLength = typeof val === 'string' ? val.length : val !== undefined ? val.toString().length : 0
      return Math.max(maxLength, valLength)
    }, columnName.length)
  const columnDef = (columnName: string) => ({
    header: columnName,
    get: (row: typeof rows[number]) => chalk.magentaBright(`${row[columnName]}`),
    minWidth: maxLength(columnName) + cellHorizontalPadding,
  })
  const columns: Table.table.Columns<{ [k: string]: string }> = {}
  Object.keys(rows[0]).forEach((columnName) => (columns[columnName] = columnDef(columnName)))
  cli.table(rows, columns)
}
