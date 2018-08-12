import simpleChain from './simpleChain';

const Blockchain =simpleChain.Blockchain;
const Block =simpleChain.Block;

let blockchain = new Blockchain();

blockchain.addBlock(new Block("test data2"))
    .then(result=>{if(result) blockchain.getBlockHeight()})
    .then(_=>{
        blockchain.getBlock(0)
        blockchain.getBlock(1)
        blockchain.validateBlock(0)
        blockchain.validateBlock(1)
    })
    .then(_ => {
        // ###### Test validateChain() with no error block ########
        blockchain.validateChain()
    })
    .then(_=>{
        // ###### Test validateBlock() with new add block ########
        blockchain.setBlockBodyForTest(1,'induced chain error 1')
        blockchain.setBlockBodyForTest(100,'induced chain error 100')
        blockchain.validateBlock(0)
        blockchain.validateBlock(1)
        blockchain.validateBlock(100)
    })
    .then(_ => blockchain.validateChain())


