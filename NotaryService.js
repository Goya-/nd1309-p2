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
    // if address in validPool，update request time ,validationWindow and message
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
                validationPool = this.updateValidationPool(validationPool)
                let validationIndex = validationPool.findIndex(validation => validation.address == address);
                let updateValidation = validationPool[validationIndex]
                updateValidation.requestTimeStamp = requestTime.toString();
                updateValidation.validationWindow = validationWindow;
                updateValidation.message = address + ":" + requestTime + ":" + "starRegistry";
                updateValidation.valid = false;
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
        // console.log('oldValidation',oldValidation);
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
                if(verifyResult){
                    verifyValidation = "valid";
                    result.valid = true
                    // update validPool
                    let objIndex = validationPool.findIndex(obj => obj.address == result.address)
                    validationPool[objIndex].valid = true
                    // console.log("validationPool after update valid",validationPool);
                    db.put('validPool', validationPool)
                        .catch(reject=>console.log("reject:",reject))
                        // .then(_=>db.get('validPool').then(resolve=>console.log("resolve:",resolve)))
                }else{
                    verifyValidation = "invalid"
                }
                
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

    updateValidationPool(validateArray){
        console.log("validateArray input",validateArray);
        validateArray.forEach(element => {
            const oldTime = element.requestTimeStamp;
            element.requestTimeStamp = Math.round(+new Date() / 1000);
            element.validationWindow = this.validationWindowConf - (element.requestTimeStamp - oldTime);
            element.message = element.address + ":" + element.requestTimeStamp + ":" + "starRegistry";
        });
        console.log("validateArray foreach after",validateArray);
        return validateArray
    }

    // for test
    async getValidationPool(){
        try {
            let validationPool = await db.get('validPool');
            // console.log("validationPool before update:", validationPool);
            validationPool = this.updateValidationPool(validationPool)
            // console.log("validationPool after update:", validationPool);
            return Promise.resolve(validationPool)   
        } catch (error) {
            // console.log("getValidationPool",error);
            return Promise.reject(error)
        }
    }
}

module.exports.NotaryService = NotaryService;
module.exports.Notarydb = db;