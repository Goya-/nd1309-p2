## Configure LevelDB to persist dataset

SImpleChain.js includes the Node.js level library and configured to persist data within the project directory.

## Modify simpleChain.js functions to persist data with LevelDB

addBlock(newBlock) includes a method to store newBlock within LevelDB

Genesis block persist as the first block in the blockchain using LevelDB

## Modify validate functions

validateBlock() function to validate a block stored within levelDB

validateChain() function to validate blockchain stored within levelDB

## Modify getBlock() function

getBlock() function retrieves a block by block heigh within the LevelDB chain.

## Modify getBlockHeight() function

getBlockHeight() function retrieves current block height within the LevelDB chain.