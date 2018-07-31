/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB, {valueEncoding:'json'});

// Add data to levelDB with key/value pair
function addLevelDBData(key,value){
  db.put(key, value, function(err) {
    if (err) return console.log('Block ' + key + ' submission failed', err);
  })
}

// Get data from levelDB with key
function getLevelDBData(key){
  db.get(key, function(err, value) {
    if (err) return console.log('Not found!', err);
    console.log('Value = ' + value);
  })
}

// Add data to levelDB with value
function addDataToLevelDB(value) {
    let i = 0;
    db.createReadStream().on('data', function(data) {
          i++;
        }).on('error', function(err) {
            return console.log('Unable to read data stream!', err)
        }).on('close', function() {
          console.log('Block #' + i);
          addLevelDBData(i, value);
        });
}

/* ===== Testing ==============================================================|
|  - Self-invoking function to add blocks to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blocks per hour                            |
|     (13.89 hours for 500,000 blocks)                                         |
|    Bitcoin blockchain adds 8640 blocks per day                               |
|     ( new block every 10 minutes )                                           |
|  ===========================================================================*/

// (function theLoop (i) {
//   setTimeout(function () {
//     addDataToLevelDB(new Block('Testing data'));
//     if (--i) theLoop(i);
//   }, 100);
// })(15);

// db.createReadStream().on('data', function(data) {
//   key = JSON.parse(data.key);
//   value = data.value;
//   console.log(key,value,typeof key, typeof value)
// }).on('close', function() {
//   console.log("read over")
// });

// db.createKeyStream().on('data',function(key){
//   console.log(JSON.parse(key),typeof JSON.parse(key))
// })

// let myObj = {
//   "name":"John",
//   "age":30,
//   "cars": [
//       { "name":"Ford", "models":[ "Fiesta", "Focus", "Mustang" ] },
//       { "name":"BMW", "models":[ "320", "X3", "X5" ] },
//       { "name":"Fiat", "models":[ "500", "Panda" ] }
//   ]
// }

db.get('data',function(err,value){
  if(value!=null){
    console.log('have')
    console.log(value,typeof value)
  }else{
    // db.put('chain',myObj,function(err){
    //   if(err) {
    //     return console.log('Ooops!', err)
    //   }else{
    //     console.log('add')
    //   }
    // })
  }
})


// db.get('arrayTest',function(err,value){
//   console.log(value,typeof value)
// })
