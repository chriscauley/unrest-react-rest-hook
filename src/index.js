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
  let last_url
  const fetch_times = {}
  const {
    prepData = noop, // manipulate data before between fetch and render
    fetch = window.fetch, // override default fetch
    propName = 'api',
    use_last = false,
    processRequest = (r) => r.json(), // default assumes data is json
  } = options

  const makeUrl = (props) => {
    try {
      return settings.root_url + template(url_template)(props)
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
      .then(processRequest)
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
    let data = store.state[url]
    const needs_fetch = !data || fetch_times[url] < stale_at
    if (needs_fetch && !is_loading[url]) {
      refetch(store, props) // sets is_loading[url]
    }

    // sometimes you want a component to continue rendering last data while fetching new data, eg pagination
    if (!data && use_last) {
      data = store.state[last_url]
    }
    last_url = url
    return { loading: is_loading[url], ...data }
  }
  const actions = { refetch, getData }
  const makeHook = globalHook(React, settings.getInitialState(), actions)

  const og_prop_name = propName
  const use = (props) => {
    const [_, stateActions] = makeHook()
    const data = stateActions.getData(props)
    return {
      makeUrl,
      ...data,
      refetch: stateActions.refetch,
    }
  }
  const RestHook = (Component, extraOptions = {}) => {
    const { propName = og_prop_name, ...extraProps } = extraOptions
    return function APIProvider(props) {
      const connectedProps = {
        ...props,
        ...extraProps,
        [propName]: use(props),
      }

      return <Component {...connectedProps} />
    }
  }

  RestHook.markStale = () => (stale_at = new Date())
  RestHook.use = use
  return RestHook
}
