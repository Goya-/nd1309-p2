# Udacity BLND Project3

## How to run

1. use `npm install` install all dependence, *express.js* require.
2. ~~all test code in `app.mjs`, use `npm run app` run it.~~
3. ~~uncomment code in `app.mjs` to test varies of functions.~~
4. all server code in `server.mjs`, use `npm run server` run it.

## endpoint

### Get block endpoint

request example command:

`curl -X "GET" "http://localhost:8000/block/0"`

### Post block endpoint

request example command:

`curl -X "POST" "http://localhost:8000/block" -H 'Content-Type: application/json' -d $'{"body":"block body contents"}'`
