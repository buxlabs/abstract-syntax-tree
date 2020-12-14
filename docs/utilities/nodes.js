const types = require('../../types.json')

let template = `
| Type                     | Example                           |
|--------------------------|:---------------------------------:|
`
types.sort().forEach(type => {
  const padding = 24 - type.length
  template += `| ${type + ' '.repeat(padding)} | ${' '.repeat(33)} |\n`
})

console.log(template)
