import { toLower, camelCase } from 'lodash-es';

export const RESERVED_MODEL_WORDS = [
  'ID',
  'CreatedAt',
  'UpdatedAt',
  'DeletedAt',
]

export const RESERVED_DB_WORDS = [
  'search',
  'ANALYSE',
  'ANALYZE',
  'ALL',
  'AND',
  'ANY',
  'ARRAY',
  'AS',
  'ASC',
  'ASYMMETRIC',
  'AUTHORIZATION',
  'BINARY',
  'BOTH',
  'CASE',
  'CAST',
  'CHECK',
  'COLLATE',
  'COLUMN',
  'CONCURRENTLY',
  'CONSTRAINT',
  'CREATE',
  'CROSS',
  'CURRENT_CATALOG',
  'CURRENT_DATE',
  'CURRENT_ROLE',
  'CURRENT_SCHEMA',
  'CURRENT_TIME',
  'CURRENT_TIMESTAMP',
  'CURRENT_USER',
  'DEFAULT',
  'DEFERRABLE',
  'DESC',
  'DISTINCT',
  'DO',
  'ELSE',
  'END',
  'EXCEPT',
  'FALSE',
  'FETCH',
  'FOR',
  'FOREIGN',
  'FREEZE',
  'FROM',
  'FULL',
  'GRANT',
  'GROUP',
  'HAVING',
  'ILIKE',
  'IN',
  'INITIALLY',
  'INNER',
  'INTERSECT',
  'INTO',
  'IS',
  'ISNULL',
  'JOIN',
  'LATERAL',
  'LEADING',
  'LEFT',
  'LIKE',
  'LIMIT',
  'LOCALTIME',
  'LOCALTIMESTAMP',
  'NATURAL',
  'NOT',
  'NOTNULL',
  'NULL',
  'OFFSET',
  'ON',
  'ONLY',
  'OR',
  'ORDER',
  'OUTER',
  'OVERLAPS',
  'PLACING',
  'PRIMARY',
  'REFERENCES',
  'RETURNING',
  'RIGHT',
  'SELECT',
  'SESSION_USER',
  'SIMILAR',
  'SOME',
  'SYMMETRIC',
  'TABLE',
  'TABLESAMPLE',
  'THEN',
  'TO',
  'TRAILING',
  'TRUE',
  'UNION',
  'UNIQUE',
  'USER',
  'USING',
  'VARIADIC',
  'VERBOSE',
  'WHEN',
  'WHERE',
  'WINDOW',
  'WITH',
];

export const checkFirstSymbolIsLetter = (value) => {
  const isLetter = value[0] && value[0].match(/[a-z]/i);
  if (!isLetter) throw Error('Name must start with letter');
}

export const checkPermittedSymbols =  (value) => {
  const has = !value.match(/^[a-z0-9 _]+$/i);
  if (has) throw Error('Name must contain only letters, digits, spaces and underscores');
}

export const checkReservedModelWordsDuplicate = (value) => {
  const has = RESERVED_MODEL_WORDS
  .some(word => [toLower(word), toLower(camelCase(word))].includes(toLower(camelCase(value))));
  if (has) throw Error('Provided name already in use by system');
}

export const checkReservedDBWordsDuplicate = (value) => {
  const has = RESERVED_DB_WORDS
  .some(word => [toLower(word), toLower(camelCase(word))].includes(toLower(camelCase(value))));
  if (has) throw Error('Provided name already in use by system');
}

// TODO: Move to chekNameDiplicates func
export const checkRelationNameDuplicates = (compareObjects, compareValue, ignoreValue) => {
  if (compareValue == null) throw Error('Validation internal error: Compare value must be provided')
  if (toLower(camelCase(compareValue)) === toLower(camelCase(ignoreValue))) return;

  const hasDuplicate = Object.entries(compareObjects)
  .some(([key, value]) =>  {
    return [toLower(key), toLower(value.name), toLower(camelCase(value.name))]
      .includes(toLower(camelCase(compareValue)))
  });
  if (hasDuplicate) throw Error('Provided name already exists');
}

export const checkNameDuplicates = (compareObjects, compareValue, ignoreModelId) => {
  if (compareValue == null) throw Error('Validation internal error: Compare value must be provided')

  const hasDuplicate = Object.entries(compareObjects)
  .filter(([key, value]) => {
    return value.id !== ignoreModelId;
  })
  .some(([key, value]) => {
    return [toLower(key), toLower(value.name), toLower(camelCase(value.name))]
      .includes(toLower(camelCase(compareValue)))
  });
  if (hasDuplicate) throw Error('Provided name already exists');
}
