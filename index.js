const express = require('express');
const simpleChain = require('./simpleChain');
const bodyParser = require('body-parser');
const notaryService = require('./NotaryService');

const Blockchain =simpleChain.Blockchain;

let blockchain = new Blockchain();
let notary = new notaryService();

const PORT = 8000;
let app = express();

app.use(bodyParser.json());

// get block, return block json
app.get(
    '/block/:height',(req,res)=>{
    blockchain.getBlock(req.params.height)
        .then(result => res.send(result))
        .catch(blockHeight => res.send({ error:'Blockheight '+ blockHeight + ' is out of index.'}))       
});

// post block, return new block json
app.post(
    '/block',(req,res)=>{ 
    if(req.body.hasOwnProperty("body")){
        blockchain.addBlock(req.body)
            .then(_ => blockchain.getBlockHeight())
            .then(height =>{
                blockchain.getBlock(height).then(block=>res.send(block));
            });
    }else{
        res.send('error:request should like {"body":"XXXXXXXXXXXXX"}');
    }
});

app.post(
    '/requestValidation',(req,res)=>{
        if(req.body.hasOwnProperty("address")){
            notary.requestValidation(req.body.address)
                .then(resolve => res.send(resolve))
                .catch(reject=> res.send(reject));
        } else {
            res.send('error:request should like {"address":"XXXXXXXXXXXXX"}');
        }
    }
);

app.post(
    '/message-signature/validate',(req,res)=>{
        if (req.body.hasOwnProperty("address") && req.body.hasOwnProperty("signature")){
            notary.validateMessage(req.body.address,req.body.signature)
                .then(resolve =>res.send(resolve))
                .catch(reject => res.send(reject));
        } else {
            res.send('error:request should like {"address":"XXXXXXX","signature":"xxxxxxxxx"}');
        }
    }
);
app.listen(PORT,() => console.log('run server on port '+PORT));