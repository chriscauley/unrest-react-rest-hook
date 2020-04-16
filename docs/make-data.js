const pokemon = require('pokemon')
const fs = require('fs')
const { range } = require('lodash')

const PER_PAGE = 10

const datasets = [
  ["Ghost Busters", ["Peter Venkman", "Ray Stantz", "Egon Spengler", "Winston Zeddemore"]],
  ["Ninja Turtles", ["Leonardo", "Michelangelo", "Donatello", "Raphael"]],
  ["Pokemon", pokemon.all().sort()],
]

const files = {
  'index.json': {character_types: []},
}

datasets.forEach( args => {
  const [name, list] = args
  const slug = name.toLowerCase().replace(' ','')
  const pages = Math.ceil(list.length/PER_PAGE)
  files['index.json'].character_types.push({name, slug, pages})
  files[slug+'.json'] = { results: list.slice(0, PER_PAGE) }
  range(1,pages+1).forEach(page_no => {
    const filename = slug+'-'+page_no+'.json'
    files[filename] = { results: list.slice(page_no*PER_PAGE, (page_no+1)*PER_PAGE) }
  })
})


const DIR = './dist/data/';
!fs.existsSync('./dist') && fs.mkdirSync('./dist')
!fs.existsSync(DIR) && fs.mkdirSync(DIR)

Object.entries(files).forEach(
  (args) => fs.writeFileSync(DIR+args[0], JSON.stringify(args[1]))
)