# React Rest Hooks

This is a lightweight alternative to using Redux/Sagas/Thunk I'm building using [use-global-hook](https://www.npmjs.com/package/use-global-hook). This is currently under development and features will be added as I use them, but if you're interested please open an issue here or on twitter @oneFierceLinter.

## Usage

Install with `npm install @unrest/react-rest-hook` and connect a component to an api endpoint like:

``` javascript
// app/withUserProfile.js
import RestHook from '@unrest/react-rest-hook'

const withUserProfile = RestHook(
  '/api/user/profile/${props.user_id}/',
  { propName: 'user_profile' } // defaults to api, see note
)

// any other file, import the above and...
const UserCard = withUserProfile((props) => {
  const { loading, user } = props.user_profile // note 2
  if (loading && !user) { // see notes 3 & 4 & 5
    return null
  }
  const { avatar_url, id, username, like_count, refetch } = user
  const doLike = () => {
    fetch('/api/like-user/' + props.user_id)
      .then(() => refetch(props))
  }

  return (
    <div>
      <img src={avatar_url} />
      <div>{username}</div>
      <div>Liked: {like_count} times!</div>
      <button onClick={doLike}>Like this person</button>
    </div>
  )
})
```

`<UserCard user_id={1} />` will make an api request once and only once no matter how many times it appears on the site. Any other components wrapped in `withUserProfile` with the property `user_id={1}` share the same data and will refetch together when `props.api.refetch(props)` is called.

### Notes:

1. I usually just do `RestHook(url_template)` and `const {loading ...} = props.api`, but you can customize `propName` incase you need to use multiple hooks on the same component.

2. This assumes the api endpoint data is formated like: `{ user: {...} }`. If you look at the `connectedProps` of `src/index.js` in this repo you'll see that the state and actions of this hook are both flattened so `props.api = {...jsonDataFromApi, makeUrl, refetch}`

3. `refetch(props)` will make a second call to `/api/user/profile/${props.user_id}/` and all components with this hook (and the same `props.user_id`) will be set to `loading=true` and will reload with new data when the fetch completes.

4. While `loading=true` the stale data is still available from `props.user_profile`. Therefore `if (loading && !user) return null` allows the component to render during refetch. `if (loading) return null` would cause an annoying flicker.

5. If you add the option `use_last: true` to RestHook options, then it will use the previous url data while loading (eg, going from `?page=1` to `?page=2` will show page 1 data until page 2 has loaded). I'm considering making this the default behavior.

## Using with `react-router-dom`

Typically I use this in combination with `react-router-com`. Because this supplies url parameters, you can use them in generating the API url:

``` javascript
const withBlogPost = RestHook('/api/blog/${match.params.blog_id}/')

const BlogPostDetail = withBlogPost((props) => {
  const { blog_post } = props.api
  // ...
}

// elsewhere, in route

<BrowserRouter>
  <Route path="/blog/:blog_id/:blog_slug/" component={BlogPostDetail} />
</BrowserRouter>
```

## With query params

Components can use the windows query parameters to make a "pass-through" component as follows, but there are some potential gotchas. The following works, but I would recommend using `react-router-dom` or another provider if possible:

``` javascript
// This is risky, but quite useful while prototyping
const withBlogPosts = RestHook('/api/blog/?${window.location.search}')

// safer, but requires a provider that can derive "search" from window.location or react-router-dom
const withBlogPosts = RestHook('/api/blog/?${props.search}')
```

The top approach is risky because:

* It isn't deterministic because `page=1&limit=10` is considered different from `limit=10&page=1`.

* "inert" query parameters also make query parameters distinct, so `page=1` is different from `page=1&foo=2` even if the endpoint doesn't care about the value of foo.

* Since `window.location.search` is not tied actually a prop, changing the search will not always trigger a rerender of the component.