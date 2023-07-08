export const MAP_LAYERS = Object.freeze({
  ID: 'id',
  DESCRIPTION: 'description',
  locationId: 'locationId',
  name: 'name',
  url: 'url',
})

export const CQL_OPERATORS = Object.freeze([
  {
    name: "EQUALS",
    function: (key, val) => `${key}='${val}'`,
  },
  {
    name: "NOT EQUALS",
    function: (key, val) => `${key}!='${val}'`
  },
  {
    name: "GREATER THAN",
    function: (key, val) => `${key} > '${val}'`
  },
  {
    name: "GREATER THAN EQUALS",
    function: (key, val) => `${key} >= '${val}'`
  },
  {
    name: "LESS THAN",
    function: (key, val) => `${key} < '${val}'`
  },
  {
    name: "LESS THAN EQUALS",
    function: (key, val) => `${key} <= '${val}'`
  },
  {
    name: "LIKE",
    function: (key, val) => {
      try {
        var replacedStr = val.replace(/[^\x00-\x7F]/g, '%');
        return `${key} LIKE '%${replacedStr}%'`
      } catch {
        return `${key} LIKE '%${val}%'`
      }
    }
  },
  {
    name: "ILIKE",
    function: (key, val) => {
      try {
        var replacedStr = val.replace(/[^\x00-\x7F]/g, '%');
        return `${key} LIKE '%${replacedStr}%'`
      } catch {
        return `${key} LIKE '%${val}%'`
      }
    }
  },
])
