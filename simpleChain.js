/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');

/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const notaryDb = require('./NotaryService').Notarydb;

const db = level(chainDB, {
  valueEncoding: 'json'
});

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
  constructor(data) {
    this.hash = "",
      this.height = 0,
      this.body = data,
      this.time = 0,
      this.previousBlockHash = ""
  }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/
class Blockchain {
  constructor() {
    db.get('data').then(value => {
      console.log("chain is exists, read from database...");
    }).catch(err => {
      console.log("init chain...")
      db.put('data', {
        "length": 0,
        "blocks": []
      }).catch(err => console.error("something wrong with", err));
    });
  }

  async addBlock(address, starInfo) {
    try {
      const data = await db.get('data');

      // 只有在validationPool且valid为true，才给addBlock
      const validPool = await notaryDb.get('validPool');
      const result = validPool.filter(object => object.address == address && object.valid)
      console.log("validPool filter result:", result);
      if (result.length == 0) return Promise.reject({
        "error": "Your address isn't valid for register, please requestValidation again"
      })

      // Current Chain before add Block
      let tempChain = data;
      let newBlock = new Block();
      // Block height
      newBlock.height = tempChain.length;
      // Block body
      newBlock.body = {
        "address": address,
        "star": {
          "ra": starInfo.dec != undefined ? starInfo.dec : '',
          "dec": starInfo.ra != undefined ? starInfo.ra : '',
          "story": starInfo.story != undefined ? Buffer.from(starInfo.story, 'utf8').toString('hex').substring(0, 250) : ''
        }
      };
      // UTC timestamp
      newBlock.time = new Date().getTime().toString().slice(0, -3);
      // previous block hash
      if (tempChain.length > 0) {
        newBlock.previousBlockHash = tempChain.blocks[tempChain.length - 1].hash;
      }
      // Block hash with SHA256 using newBlock and converting to a string
      console.log(newBlock)
      newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
      // Adding block object to chain
      tempChain.blocks.push(newBlock);
      tempChain.length += 1;
      try {
        await db.put('data', tempChain);
        //console.log('Update Chain to ', tempChain);
        return Promise.resolve(newBlock);
      } catch (err) {
        console.log('Ooops!', err);
        return Promise.reject();
      }
    } catch (err) {
      if (err) return console.log('Add new block err', err);
    }
  }

  // Get block height
  async getBlockHeight() {
    const value = await db.get('data');
    const height = value.length - 1;
    console.log("getBlockHeight result is " + height);
    return Promise.resolve(height);
  }

  // get block
  async getBlock(blockHeight) {
    const self = this;
    try {
      const data = await db.get('data');
      const block = data.blocks[blockHeight];
      if (block == undefined) {
        console.error('Blockheight ' + blockHeight + ' is out of index.');
        return Promise.reject(blockHeight);
      } else {
        return Promise.resolve(self.decodeBlocks(block));
      }
    } catch (err) {
      return console.log('Get block is err', err);
    }
  }

  // validate block
  async validateBlock(blockHeight) {
    const self = this;
    let block = await self.getBlock(blockHeight);
    if (block == undefined) {
      return Promise.reject(console.error('Blockheight ' + blockHeight + ' is out of index.'));
      // get block hash
      const blockHash = block.hash;
      // remove block hash to test block integrity
      block.hash = '';
      // generate block hash
      const validBlockHash = SHA256(JSON.stringify(block)).toString();
      // Compare
      if (blockHash === validBlockHash) {
        console.log('Block #' + blockHeight + ' is valid')
        return Promise.resolve(true);
      } else {
        console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
        return Promise.resolve(false);
      }
    }
  }

  // Validate blockchain
  async validateChain() {
    const self = this;
    let errorLog = [];
    try {
      const data = await db.get('data');
      const height = self.getBlockHeight();
      for (var i = 0; i < height - 1; i++) {
        let blockHash = data.blocks[i].hash;
        let previousHash = data.blocks[i + 1].previousBlockHash;
        if (blockHash !== previousHash) {
          errorLog.push(i);
        }
      }
      if (errorLog.length > 0) {
        console.log('Block errors = ' + errorLog.length);
        console.log('Blocks: ' + errorLog);
        return Promise.resolve(false);
      } else {
        console.log('No errors detected');
        return Promise.resolve(true);
      }
    } catch (err) {
      return console.log('Read chain when validateChain is err', err)
    }
  }

  async getBlocksByAddress(address) {
    const self = this;
    const tempChain = await db.get('data');
    const blocksByAddress = tempChain.blocks.filter(block => block.body.address == address);
    return Promise.resolve(self.decodeBlocks(blocksByAddress));
  };

  async getBlocksByHash(hash) {
    const self = this;
    const tempChain = await db.get('data');
    const blockByHash = tempChain.blocks.filter(block => block.hash == hash);
    return Promise.resolve(self.decodeBlocks(blockByHash)[0]);
  };

  decodeBlocks(blocks) {
    if (blocks.length == undefined) {
      // json
      const buf = new Buffer(blocks.body.star.story, 'hex');
      blocks.body.star.decode = buf.toString();
    } else {
      // array
      for (let index = 0; index < blocks.length; index++) {
        const block = blocks[index];
        const buf = new Buffer(block.body.star.story, 'hex');
        block.body.star.decode = buf.toString();
      }
    }
    return blocks;
  }
}

module.exports = {
  Block,
  Blockchain
};