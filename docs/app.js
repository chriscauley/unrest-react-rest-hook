import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Link } from 'react-router-dom'
import { last } from 'query-string'
import qs from 'query-string'

import RestHook from '../src'

const withCharacterTypes = RestHook('./data/index.json')

const MyComponent = withCharacterTypes(props => {
  const { loading, character_types } = props.api
  if (loading) {
    return null
  }

  const page = parseInt(
    qs.parse(window.location.search.slice(1)).page || 1
  )

  const { slug } = props.match.params
  const selected_character_type = character_types.find(
    character_type => character_type.slug === slug
  )

  return (
    <div>
      <div className="flex border-b">
        {character_types.map( ({ name, slug }) => (
          <div key={slug}>
            <Link to={`/${slug}`} className="text-blue-500 p-2">
              {name}
            </Link>
          </div>
        ))}
      </div>
      {selected_character_type && (
        <CharacterList character_type={selected_character_type} page={page} />
      )}
    </div>
  )
})

const withCharacters = RestHook('./data/${character_type.slug}-${page}.json')

const CharacterList = withCharacters(props => {
  const { pages, name, slug } = props.character_type
  const { loading, results } = props.api
  const { page } = props
  if (loading) {
    return "Loading ..."
  }
  return (
    <div className="max-w-5xl">
      <Pagination page={page} page_count={pages} />
      <ul className="ml-6 list-disc">
        {results.map(character => (
          <li key={character} className="pb-1">{character}</li>
        ))}
      </ul>
      <Pagination page={page} page_count={pages} />
    </div>
  )
})


const Pagination = ({ page, page_count }) => page_count > 1 && (
  <div className="flex">
    {page > 1 && (
      <Link to={"?page="+ (page - 1)} className="p-2 underline text-blue-500">
        &lt;
      </Link>
    )}
    <span className="p-2">On Page {page} / {page_count}</span>
    {page < page_count && (
      <Link to={"?page="+ (page + 1)} className="p-2 underline text-blue-500" disabled>
        &gt;
      </Link>
    )}
  </div>
)
class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Route path="/:slug" component={MyComponent} />
      </BrowserRouter>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('react-app')
)