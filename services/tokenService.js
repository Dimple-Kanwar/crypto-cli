const fs = require( 'fs');
const csv = require( 'csv-parser');
const { cryptoToUSD, portfolio } = require( '../utils.js');
const argv  = require( '../cli/command.js');
let tokenInfo = {};
let tokenList = [];


 const tokenInformation = (dir, loading) => {
  fs.createReadStream(`${dir}/transactions.csv`)
    .pipe(csv())
    .on('data', data => {
      if (!tokenList.includes(data.token)) {
        tokenList.push(data.token);
      }
      if (argv.token && argv.date) {
        if (
          data.token === argv.token &&
          data.timestamp >= argv.startTimestamp &&
          data.timestamp < argv.endTimestamp
        ) {
          portfolio(tokenInfo, data);
        }
      } else if (argv.token) {
        if (data.token === argv.token) {
          portfolio(tokenInfo, data);
        }
      } else if (argv.date) {
        if (
          data.timestamp >= argv.startTimestamp &&
          data.timestamp < argv.endTimestamp
        ) {
          portfolio(tokenInfo, data);
        }
      } else {
        portfolio(tokenInfo, data);
      }
    })
    .on('end', async () => {
      clearTimeout(loading);
      console.log('\n');
      if (Object.keys(tokenInfo).length === 0) {
        if (argv.date && argv.token) {
          if (tokenList.includes(argv.token)) {
            console.error(
              `No ${argv.token} token transacted on ${argv.date}`,
            );
          } else {
            console.error(`${argv.token} token not found`);
          }
        } else if (argv.date) {
          console.error(`No tokens transacted on ${argv.date}`);
        } else if (argv.token) {
          console.error(`${argv.token} token not found`);
        } else {
          console.error('No transactions in the CSV');
        }
        return;
      } else {
        for (let [token, amount] of Object.entries(tokenInfo)) {
          tokenInfo[token] = amount * (await cryptoToUSD(token));
        }
        console.log('Token portfolio in USD: ', tokenInfo);
      }
    })
    .on('error', err => console.log(err));
};

module.exports = tokenInformation