```javascript
let result;
let promise;
function fetchProfile() {
  if (result) return result;
  if (promise) throw promise;
  throw (promise = getProfile()
    .then((r) => {
      result = r;
    })
    .catch(() => (promise = undefined)));
}

<Suspense fallback={<h1>loading...</h1>}>
  <Profile id={1} />
</Suspense>;

<Fetch url="/blog/:id" param={{ id: 1 }} fallback={<h1>loading...</h1>}>
  {(profile) => <Profile {...profile} />}
</Fetch>;

const fetch = (url, param, propName) => (props) => (
  <Fetch url="/blog/:id" param={{ id: 1 }} fallback={<h1>loading...</h1>}>
    {(date) => <Profile {...{ ...props, [propName]: date }} />}
  </Fetch>
);

fetch("/blog/:id", { id: 1 }, "profile")(Profile);
```