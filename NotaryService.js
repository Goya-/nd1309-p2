// 1. requestValidation: address => message & validationWindow
// 2. message-signature/validate: address & signature => validateResult

const level = require('level');
const chainDB = './notaryData';
const db = level(chainDB, {
    valueEncoding: 'json'
});

class NotaryService{
    constructor(){
        this.validation = {}
    }
    requestValidation(address){
        var requestTime = Math.round(+new Date() / 1000);
        var message = address + ":" + requestTime + ":" + "starRegistry";
        var validationWindow = 300;
        return new Promise((resolve, reject) => {
            db.get('validation', function (err, addressPool) {
                if (addressPool != undefined) {
                    console.log("address exits in address pool :" + Object.keys(addressPool));
                    console.log("precessing " + address);
                    if (addressPool.hasOwnProperty(address)) {
                        console.log("address exits, reading...");
                        var intervel = requestTime - addressPool[address];
                        console.log("interval:" + intervel + " s");
                        if (intervel < 300) {
                            validationWindow = 300 - intervel;
                            requestTime = addressPool[address];
                        } else {
                            validationWindow = 300;
                            var _requestTime = Math.round(+new Date() / 1000);
                            addressPool[address] = _requestTime;
                            db.put('validation', addressPool, function (err) {
                                if (err) console.log('writing addresspool error');
                            });
                        }
                    } else {
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

                resolve({
                    "address": address,
                    "requestTimeStamp": requestTime.toString(),
                    "message": message,
                    "validationWindow": validationWindow
                });
            });
        });
    }
}

module.exports = NotaryService;