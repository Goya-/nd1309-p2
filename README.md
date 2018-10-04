# Udacity BLND Project3

## How to run

1. use `npm install` install all dependence, *express.js* require.
2. ~~all test code in `app.mjs`, use `npm run app` run it.~~
3. ~~uncomment code in `app.mjs` to test varies of functions.~~
4. all server code in `index.js`, use `npm run server` run it.

## endpoint

### requestValidation endpoint

```
curl -X "POST" "http://localhost:8000/requestValidation" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ"
}'
```

### message-signature/validate endpoint
```
curl -X "POST" "http://localhost:8000/message-signature/validate" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "signature": "H6ZrGrF0Y4rMGBMRT2+hHWGbThTIyhBS0dNKQRov9Yg6GgXcHxtO9GJN4nwD2yNXpnXHTWU9i+qdw5vpsooryLU="
}'
```
