import React from 'react'
import globalHook from 'use-global-hook'
import { template } from 'lodash'

export const settings = {
  root_url: '',
  disabled: false,
  getInitialState: () => ({}),
}

const noop = (a) => a

export default (url_template, options = {}) => {
  let stale_at = new Date().valueOf()
  const fetch_times = {}
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
        fetch_times[url] = new Date().valueOf()
        data = prepData(data, props) || data
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
    const needs_fetch = !data || fetch_times[url]  < stale_at
    if (needs_fetch && !is_loading[url]) {
      refetch(store, props) // sets is_loading[url]
    }
    return { loading: is_loading[url], ...data }
  }
  const actions = { refetch, getData }
  const makeHook = globalHook(React, settings.getInitialState(), actions)

  const og_prop_name = propName
  const RestHook = (Component, { propName = og_prop_name, ...extraProps } = {}) => {
    return function APIProvider(props) {
      const [_, stateActions] = makeHook()
      const data = stateActions.getData(props)
      const connectedProps = {
        ...props,
        ...extraProps,
        [propName]: {
          makeUrl,
          ...data,
          refetch: stateActions.refetch,
        },
      }

      return <Component {...connectedProps} />
    }
  }

  RestHook.markStale = () => stale_at = new Date()
  return RestHook
}