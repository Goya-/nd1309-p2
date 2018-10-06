# Udacity BLND Project2-4

## How to run

1. use `npm install` install all dependence, *express.js* require.
2. ~~all test code in `app.mjs`, use `npm run app` run it.~~
3. ~~uncomment code in `app.mjs` to test varies of functions.~~
4. all server code in `index.js`, use `npm run server` run it.

## Project4 endpoint

### requestValidation endpoint

Post your address to request validation.
```
curl -X "POST" "http://localhost:8000/requestValidation" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "1NWJMSYfKQPpVveipamcmXFPZ1Lsh7sSDD"
}'
```

Will get response like `{"address":"1NWJMSYfKQPpVveipamcmXFPZ1Lsh7sSDD","requestTimeStamp":"1538818796","message":"1NWJMSYfKQPpVveipamcmXFPZ1Lsh7sSDD:1538818796:starRegistry","validationWindow":217}`.

if last validation is over 5 minutes, response will be `{"error":"over 5 minutes, re-validating"}`.You should re-POST to get message.

### message-signature/validate endpoint

Post your address and signature from previous step's message and private key.You can using `signMessage.js` to sign the message `1NWJMSYfKQPpVveipamcmXFPZ1Lsh7sSDD:1538818796:starRegistry`.

```shell
curl -X "POST" "http://localhost:8000/message-signature/validate" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "1NWJMSYfKQPpVveipamcmXFPZ1Lsh7sSDD",
  "signature": "Hxc/hk99Z6JvxbiPBS0ZWZDnZ1lwFemK2pU3EqJYTN3EDDgg9r6YCQiosW7PI4oQvETxxFB351zghaY4j+ejP2g="
}'
```

If signature is correct.You will get response like

```json
{"registerStar":true,"status":{"address":"1NWJMSYfKQPpVveipamcmXFPZ1Lsh7sSDD","requestTimeStamp":"1538818796","message":"1NWJMSYfKQPpVveipamcmXFPZ1Lsh7sSDD:1538818796:starRegistry","validationWindow":6,"messageSignature":"valid"}}
```

If signature is not correct, response will be like

```json
{"registerStar":true,"status":{"address":"142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ","requestTimeStamp":"1538818986","message":"142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1538818986:starRegistry","validationWindow":293,"messageSignature":"invalid"}}
```

### star registration endpoint

```shell
curl -X "POST" "http://localhost:8000/block" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "1NWJMSYfKQPpVveipamcmXFPZ1Lsh7sSDD",
  "star": {
    "dec": "-26° 29'\'' 24.9",
    "ra": "16h 29m 1.0s",
    "story": "Found star using https://www.google.com/sky/"
  }
}'
```

Will get response like

```json
{"hash":"2845713070946e95a9a1a245faba7ccc343aa2922925f15220aef97cdd51f6e3","height":6,"body":{"address":"1NWJMSYfKQPpVveipamcmXFPZ1Lsh7sSDD","star":{"ra":"-26° 29' 24.9","dec":"16h 29m 1.0s","story":"466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"}},"time":"1538819425","previousBlockHash":"5141edb58a78f4ddb5bbed2e87963723e65806bdfb829212173c8c95bfa850eb"}
```

### Star Lookup endpoint

`curl "http://localhost:8000/stars/address:1NWJMSYfKQPpVveipamcmXFPZ1Lsh7sSDD"`

Will get response json-array like 

```json

[{"hash":"2845713070946e95a9a1a245faba7ccc343aa2922925f15220aef97cdd51f6e3","height":6,"body":{"address":"1NWJMSYfKQPpVveipamcmXFPZ1Lsh7sSDD","star":{"ra":"-26° 29' 24.9","dec":"16h 29m 1.0s","story":"466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f","decode":"Found star using https://www.google.com/sky/"}},"time":"1538819425","previousBlockHash":"5141edb58a78f4ddb5bbed2e87963723e65806bdfb829212173c8c95bfa850eb"}]
```

---
 
`curl "http://localhost:8000/stars/hash:2845713070946e95a9a1a245faba7ccc343aa2922925f15220aef97cdd51f6e3"` 

will get json like

```json
{"hash":"2845713070946e95a9a1a245faba7ccc343aa2922925f15220aef97cdd51f6e3","height":6,"body":{"address":"1NWJMSYfKQPpVveipamcmXFPZ1Lsh7sSDD","star":{"ra":"-26° 29' 24.9","dec":"16h 29m 1.0s","story":"466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f","decode":"Found star using https://www.google.com/sky/"}},"time":"1538819425","previousBlockHash":"5141edb58a78f4ddb5bbed2e87963723e65806bdfb829212173c8c95bfa850eb"}
```

---

`curl "http://localhost:8000/block/6"`

will get json like

```json
{"hash":"2845713070946e95a9a1a245faba7ccc343aa2922925f15220aef97cdd51f6e3","height":6,"body":{"address":"1NWJMSYfKQPpVveipamcmXFPZ1Lsh7sSDD","star":{"ra":"-26° 29' 24.9","dec":"16h 29m 1.0s","story":"466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f","decode":"Found star using https://www.google.com/sky/"}},"time":"1538819425","previousBlockHash":"5141edb58a78f4ddb5bbed2e87963723e65806bdfb829212173c8c95bfa850eb"}
```
