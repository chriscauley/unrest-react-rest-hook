import globalHook from 'use-global-hook'
import { template } from 'lodash'

import React from 'react'

export const settings = {
  root_url: '',
  disabled: false,
  getInitialState: () => ({}),
}

const noop = (a) => a

export default (url_template, options = {}) => {
  const {
    prepData = noop, // manipulate data before between fetch and render
    fetch = window.fetch, // override default fetch
    propName = 'api',
  } = options

  const makeUrl = (props) => {
    try {
      return template(url_template)(props)
    } catch (e) {
      // errors from _.template can be tricky without access to props
      console.error(
        `An error occurred trying to make a url "${url_template}" with the following props`,
        props,
      )
      throw e
    }
  }

  const is_loading = {}
  const __meta = {
    fetch_count: 0,
    logs: [],
  }

  const refetch = (store, props = {}) => {
    const url = makeUrl(props)
    is_loading[url] = true
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        data = prepData(data, props)
        is_loading[url] = false
        __meta.fetch_count += 1
        __meta.logs.push(url)
        store.setState({
          [url]: data,
        })
      })
  }
  const getData = (store, props = {}) => {
    if (settings.disabled) {
      return
    }
    const url = makeUrl(props)
    const data = store.state[url]
    if (!data && !is_loading[url]) {
      refetch(store, props) // sets is_loading[url]
    }
    return { loading: is_loading[url], ...data }
  }
  const actions = { refetch, getData }
  const makeHook = globalHook(React, settings.getInitialState(), actions)

  const og_prop_name = propName
  return (Component, { propName = og_prop_name, ...extraProps } = {}) => {
    return function APIProvider(props) {
      const [_, stateActions] = makeHook()
      const data = stateActions.getData(props)
      const connectedProps = {
        ...props,
        ...extraProps,
        [propName]: {
          ...data,
          refetch: stateActions.refetch,
        },
      }

      return <Component {...connectedProps} />
    }
  }
}
