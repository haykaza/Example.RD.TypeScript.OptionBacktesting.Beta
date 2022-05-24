export { };
const moment = require('moment');
const checkRIC = require('../findRics/checkRIC');
const getExpMonth = require('../findRics/getExpMonth');

// import { getSession } from '../Common/session';

// const session = getSession();

async function getEurexRIC(asset: string, maturity: string, strike: number, optType: string, session: any) {
    // await session.open()
    let expDate = moment(new Date(maturity)).format('YYYY-MM-DD');
    let assetName = '';

    if (asset[0] == '.') {
        assetName = asset.split('.', 2)[1];
        if (assetName === 'FTSE') {
            assetName = 'OTUK'
        }
        else if (assetName === 'SSMI') {
            assetName = 'OSMI'
        }
        else if (assetName === 'GDAXI') {
            assetName = 'GDAX'
        }
        else if (assetName === 'ATX') {
            assetName = 'FATXA'
        }
        else if (assetName === 'STOXX50E') {
            assetName = 'STXE'
        }
    }
    else {
        assetName = asset.split('.', 2)[0];
    };

    const expDetails = getExpMonth(expDate, optType);
    let intPart = null;
    let decPart = null;
    let strikeRIC = '';

    if (strike % 1 !== 0) {
        intPart = Math.floor(strike);
        decPart = String(strike).split('.', 2)[1][0]
    }
    else {
        intPart = Math.floor(strike)
        decPart = '0'
    }
    if (String(Math.floor(strike)).length === 1) {
        strikeRIC = `0${String(intPart)}${decPart}`
    }
    else {
        strikeRIC = `${String(intPart)}${decPart}`
    }
    let possibleRICs = [];
    const generations = ['', 'a', 'b', 'c', 'd']
    for (let gen in generations) {
        const ric = `${assetName}${strikeRIC}${generations[gen]}${expDetails[1]}${moment(expDate).format('Y').slice(-1)}.EX`
        const response = await checkRIC(ric, maturity, expDetails[0], session);
        if (Object.keys(response[1]).length !== 0) {
            // session.close()
            return response
        }
        else {
            possibleRICs.push(response[0])
        };
    }
    console.log(`Here is a list of possible RICs ${possibleRICs}, however we could not find any prices for those!`)
    // session.close()
    return possibleRICs
}

module.exports = getEurexRIC;

// getEurexRIC('BARC.L', '2022-03-18', 210, 'P', session).then((a: any) => {
//     console.log(a)
// })
