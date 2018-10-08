var bitcoin = require('bitcoinjs-lib') // v3.x.x
var bitcoinMessage = require('bitcoinjs-message')

var keyPair = bitcoin.ECPair.fromWIF('L1LUT2rHPwewdaXZ39U5n8pYGxWtjsQ3HrvQ9kq3WwX7dSUpHvQU') //1NWJMSYfKQPpVveipamcmXFPZ1Lsh7sSDD
var privateKey = keyPair.privateKey
var message = '1NWJMSYfKQPpVveipamcmXFPZ1Lsh7sSDD:1538993332:starRegistry'

var signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed)
console.log(signature.toString('base64'))