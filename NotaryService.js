const level = require('level');
const chainDB = './notaryData';
const db = level(chainDB, {
    valueEncoding: 'json'
});

const bitcoinMessage = require('bitcoinjs-message');

class NotaryService {
    constructor() {
        db.get('validPool')
            .catch(_ => {
                db.put('validPool', []).then(__ => console.log('Init validPool'))
            })
        this.validationWindowConf = 300; //5 minutes
    }

    // Update all address's validationWindow
    // if address in validPool，update request time and message
    // if address is not in  validPool，add address into validationPool
    async requestValidation(address) {
        try {
            const requestTime = Math.round(+new Date() / 1000);
            const message = address + ":" + requestTime + ":" + "starRegistry";
            const validationWindow = this.validationWindowConf; //300
            const newValidation = {
                "address": address,
                "requestTimeStamp": requestTime.toString(),
                "message": message,
                "validationWindow": validationWindow
            }
            let validationPool = await db.get('validPool');

            try {
                validationPool.forEach(element => {
                    const oldTime = element.requestTimeStamp;
                    element.validationWindow = validationWindow - (Math.round(+new Date() / 1000) - oldTime);
                });
                let validationIndex = validationPool.findIndex(validation => validation.address == address);
                let updateValidation = validationPool[validationIndex]
                updateValidation.requestTimeStamp = requestTime.toString();
                updateValidation.validationWindow = validationWindow;
                updateValidation.message = address + ":" + requestTime + ":" + "starRegistry";
                console.log("After update validationPool: ", validationPool)
            } catch (err) {
                validationPool.push(newValidation)
                console.log(validationPool);
            }
            db.put('validPool', validationPool)
            return Promise.resolve(newValidation)
        } catch (err) {
            console.log(err)
            return Promise.reject({
                "err": "Read validationPool error"
            });
        }
    }

    // if address not in validPool，remind need request first
    // if address in validPool，but over 5 minitues after last validaterequest，also remind need re-request
    // if address in validPool and less 5 minitues after last validaterequest， read message of validpool to verify
    async validateMessage(address, signature) {
        const validationPool =  await db.get('validPool');
        const oldValidation = validationPool.filter(validation => validation.address == address);
        console.log('oldValidation',oldValidation);
        oldValidation[0].validationWindow = this.validationWindowConf - (Math.round(+new Date() / 1000) - oldValidation[0].requestTimeStamp) //update validation
        if(oldValidation.length == 0){
            return Promise.reject({
                "error": "You need requestValidation first for " + address
            })
        } else if (oldValidation[0].validationWindow<0) {
            return Promise.reject({
                "error": "Over 5 minites after last requestValidation, you need to re-request"
            })
        }else{
            let verifyValidation = ""
            const result = oldValidation[0]
            try{
                const verifyResult  = bitcoinMessage.verify(result.message, address, signature);
                verifyValidation = verifyResult? "valid": "invalid"
            }catch(err){
                verifyValidation = "invalid"
            }
            
            return Promise.resolve({
                "registerStar": true,
                "status": {
                    "address": result.address,
                    "requestTimeStamp": result.requestTimeStamp,
                    "message": result.message,
                    "validationWindow": result.validationWindow,
                    "messageSignature": verifyValidation
                }
            });
        }
    }
}

module.exports = NotaryService;