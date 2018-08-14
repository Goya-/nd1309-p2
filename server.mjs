import  express from 'express';
import simpleChain from './simpleChain';
import bodyParser from 'body-parser';

const Blockchain =simpleChain.Blockchain;

let blockchain = new Blockchain();

const PORT = 8000;
let app = express();

app.use(bodyParser.json())

// get block, return block json
app.get('/block/:height',(req,res)=>{
    blockchain.getBlock(req.params.height)
        .then(result => res.send(result))
        .catch(blockHeight => res.send({ error:'Blockheight '+ blockHeight + ' is out of index.'}))       
})

// post block, return new block json
app.post(
    '/block',(req,res)=>{ 
    if(req.body.hasOwnProperty("body")){
        blockchain.addBlock(req.body)
            .then(_ => blockchain.getBlockHeight())
            .then(height =>{
                blockchain.getBlock(height).then(block=>res.send(block))
            } )
    }else{
        res.send('error:request should like {"body":"XXXXXXXXXXXXX"}')
    }
})

app.listen(PORT,() => console.log('run server on port '+PORT))