const level = require('level');
const chainDB = './notaryData';
const db = level(chainDB, {
    valueEncoding: 'json'
});

const bitcoinMessage = require('bitcoinjs-message');

class NotaryService{
    constructor(){
        this.validation = {};
        this.validationWindowConf = 300; //5 minutes
    }

    requestValidation(address){
        var requestTime = Math.round(+new Date() / 1000);

        var validationWindow = this.validationWindowConf;
        var self = this;
        return new Promise((resolve, reject) => {
            db.get('validation', function (err, addressPool) {
                if (addressPool != undefined) {
                    console.log("address exits in address pool :" + Object.keys(addressPool));
                    console.log("precessing " + address);
                    if (addressPool.hasOwnProperty(address)) {
                        console.log("address exits, reading...");
                        var intervel = requestTime - addressPool[address];
                        console.log("interval:" + intervel + " s");
                        if (intervel < self.validationWindowConf) {
                            validationWindow = self.validationWindowConf - intervel;
                            requestTime = addressPool[address];
                        } else {
                            // need re-validate over validationWindowConf
                            validationWindow = self.validationWindowConf;
                            var _requestTime = Math.round(+new Date() / 1000);
                            addressPool[address] = _requestTime;
                            db.put('validation', addressPool, function (err) {
                                if (err) console.log('writing addresspool error');
                            });
                            reject({"error":"over 5 minutes, re-validating"});
                        }
                    } else {
                        // add address to addresspool in first validate
                        console.log("address no exits, creating...");
                        addressPool[address] = requestTime;
                        console.log(Object.keys(addressPool));
                        db.put('validation', addressPool, function (err) {
                            if (err) console.log('writing addresspool error');
                        });
                    }
                } else {
                    console.log("addressPool no exits, init...");
                    var newAddressPool = {};
                    newAddressPool[address] = requestTime;
                    db.put('validation', newAddressPool, function (err) {
                        if (err) console.log('writing addresspool error:' +err);
                    });
                }

                var message = address + ":" + requestTime + ":" + "starRegistry"; // 
                resolve({
                    "address": address,
                    "requestTimeStamp": requestTime.toString(),
                    "message": message,
                    "validationWindow": validationWindow
                });
            });
        });
    }

    validateMessage(address, signature) {
        return new Promise((resolve,reject)=>{
            this.requestValidation(address).then(result=>{
                var isValid = bitcoinMessage.verify(result.message, address, signature) ? "valid":"invalid";
                resolve({
                    "registerStar": true,
                    "status": {
                        "address": result.address,
                        "requestTimeStamp": result.requestTimeStamp,
                        "message": result.message,
                        "validationWindow": result.validationWindow,
                        "messageSignature": isValid
                    }
                });
            }).catch(_=>reject({
                "error": "re-validation",
            }));
        });
    }
}

module.exports = NotaryService;