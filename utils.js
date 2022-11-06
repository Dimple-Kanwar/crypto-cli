const fetch = require('node-fetch');

 const cryptoToUSD = async tokenName => {
  try {
    let url = new URL(process.env.CRYPTOCOMPARE_URL);
    url.search = new URLSearchParams({
      fsym: tokenName,
      tsyms: 'USD',
      api_key: process.env.CRYPTOCOMPARE_API_KEY,
    }).toString();
    let response = await fetch(url);
    if (response.ok) {
      response = await response.json();
      if (response.Response === 'Error') {
        throw new Error(response.Message);
      }
      return response.USD;
    }
  } catch (err) {
    console.log(err.message);
  }
};

const dateToEpochTime = date => {
  date = new Date(`${date}T00:00:00`);
  let userTimezoneOffset = date.getTimezoneOffset() * 60 * 1000;
  const startTimestamp =
    parseInt(new Date(date.getTime() - userTimezoneOffset).getTime()) / 1000;
  const endTimestamp =
    parseInt(
      new Date(
        date.getTime() + 24 * 60 * 60 * 1000 - userTimezoneOffset,
      ).getTime(),
    ) / 1000;

  return [startTimestamp, endTimestamp];
};

const isDateValid = date => {
  return (
    new Date(`${date}T00:00:00`) instanceof Date &&
    !isNaN(new Date(`${date}T00:00:00`).valueOf())
  );
};

const loading = function () {
  var P = ['\\', '|', '/', '-'];
  var x = 0;
  return setInterval(function () {
    process.stdout.write('\r' + P[x++]);
    x &= 3;
  }, 250);
};

const portfolio = (tokenInfo, data) => {
  if (!tokenInfo[data.token]) {
    tokenInfo[data.token] =
      data.transaction_type === 'DEPOSIT'
        ? Number(data.amount)
        : Number(-data.amount);
  } else {
    tokenInfo[data.token] =
      data.transaction_type === 'DEPOSIT'
        ? Number(tokenInfo[data.token]) + Number(data.amount)
        : Number(tokenInfo[data.token]) - Number(data.amount);
  }
};

module.exports = { loading, portfolio, isDateValid, dateToEpochTime, cryptoToUSD }