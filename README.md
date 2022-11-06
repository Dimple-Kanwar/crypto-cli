# Token CLI program

## Programming langauge:  nodejs

## Dependencies:

- csv-parser: To parse the CSV file content.

- dot-env : To load the .env file in the application.

- fs: To access the CSV file.

- node-fetch: To call the cryptocompare API to fetch exchange rate of a crypto in USD.

- yargs: To convert this app into command line program.

## Dev-Dependencies:

- @types/node: This package contains type definitions for Node.js

## Task:

Let us assume you are a crypto investor. You have made transactions over a period of time which is logged in a CSV file. Write a command line program that does the following:-

- Given no parameters, return the latest portfolio value per token in USD
- Given a token, return the latest portfolio value for that token in USD
- Given a date, return the portfolio value per token in USD on that date
- Given a date and a token, return the portfolio value of that token in USD on that date

## How to run the program ?

> **Note:** Please add the transactions.csv in the root folder to run this program.

> **Note:** tokenInfo is the command name

sample content of transactions.csv file for testing:

    timestamp,transaction_type,token,amount
    1667664958,DEPOSIT,BTC,5
    1667837758,DEPOSIT,ETH,6
    1667924158,WITHDRAWAL,BTC,3
    1668010558,WITHDRAWAL,ETH,3

## Test Cases
#### 1. Without any arguments

```diff
node main.js tokenInfo
```

#### 2. With token as an argument

```diff
node main.js tokenInfo --token BTC
```

or

```diff
node main.js tokenInfo -t BTC
```

#### 3. With date as an argument

```diff
node main.js tokenInfo --date 2022-11-05
```

or

```diff
node main.js tokenInfo -d 2022-11-05
```

> _**Note**: Date need to be on YYYY-MM-DD format_

#### 4. With token and date as an argument

```diff
node main.js tokenInfo --token BTC --date 2022-11-05
```

or

```diff
node main.js tokenInfo -t BTC -d 2022-11-05
```

#### 5. For help

```diff
node main.js help
```

#### 5. For any help related to tokenInfo command

```diff
node main.js tokenInfo --help
```

or

```diff
node main.js tokenInfo -h
```

## Design decision to solve this problem

### 1. Parsing the contents of CSV

There are two approaches to parse the content of CSV which are the event driven approach and promise based approach. I have used `csv-parser` module for event driven approach as it can parse file of any size because it gets data on chunks. 

### 2. Command Line Program

I have used `yargs` module in this node program as its help in creating our own command-line commands in node.js and makes command-line arguments flexible and easy to use. It seems that we will be having four different types of command to solve this task. Command will be on this format.

1. Command without any arguments

2. Command with token as an argument

3. Command with date as an argument

4. Command with both token and date as an arguments

### 3. Yargs setup

```shell
yargs
  .usage('Usage: node $0 <command> [options]')
  .command('tokenInfo', 'List the information of the token', yargs => {
    return yargs
      .option({
        token: {
          alias: 't',
          description: 'Enter token name',
          type: 'string',
        },
        date: {
          alias: 'd',
          description: 'Enter date in YYYY-MM-DD format',
          type: 'string',
        },
      })
      .strictOptions()
      .check((arg, options) => {
        arg.command = arg._[0];
        if (arg.hasOwnProperty('token')) {
          if (!arg.token) {
            throw new Error('Enter token name');
          }
        }
        if (arg.hasOwnProperty('date')) {
          if (arg.date) {
            if (isDateValid(arg.date)) {
              let [startTimestamp, endTimestamp] = dateToEpochTime(arg.date);
              arg.startTimestamp = startTimestamp;
              arg.endTimestamp = endTimestamp;
            } else {
              throw new Error('Please enter valid date in YYYY-MM-DD format');
            }
          } else {
            throw new Error('Please enter date');
          }
        }
        return true;
      });
  })
  .strictCommands()
  .check((arg, options) => {
    if (!commandList.includes(arg._[0])) {
      throw new Error('Please enter a valid command');
    }
    return true;
  })
  .help()
  .alias('help', 'h').argv;
```

For this purpose, I have created a command tokenInfo, --token and -t options to pass the token name and --date and -d option to pass the date. For now, any others options and beside this will be invalid as we have used `strictOptions()` and `strictCommands()`. If we need any other commands or options in the future, we can add it later.

`To make the code more manageable, I have used the command approach as we may need multiple command in the future.`

If token or date is passed as an arguments on tokenInfo command, we will validate them before passing to the main function.

#### 4. Error Handling on different scenarios

##### I. If token name is missing

```js
node main.js tokenInfo --token
```

If user has enabled the --token option but didn't pass the value of the token name. In this situation, we will validate it with in the `check()` function and throw an error `Enter a token name` and program get terminated.

##### II. If date is missing

```
node main.js tokenInfo --date
```

If user has enabled the --date option but didn't pass any date. In this situation, we will validate it with in the `check()` function and throw an error `Please enter a date` and program get terminated.

##### III. If invalid date is entered

```js
node main.js tokenInfo --date today
```

Date passed by the user get validate inside the check() function. If it is invalid, error is thrown with message `Please enter valid date in YYYY-MM-DD format` and program get terminated.

##### IV. For invalid token name

We console the error given token not found.

##### V. If there are no transactions on given date

We console the error `No tokens transacted on the given date`.

### 5. Storing cryptocompare api key on the .env file

Cryptocompare url and api key are stored on the .env file as it lets us to customize our individual working environment variables. .env file are not committed in the git so secret credentials will be safe from outside user.

### 6. isDateValid() function to check whether date is valid or not.

```js
const isDateValid = date => {
  return (
    new Date(`${date}T00:00:00`) instanceof Date &&
    !isNaN(new Date(`${date}T00:00:00`).valueOf())
  );
};
```

### 7. Generating start epoch time and end epoch time for a given date.

For a given date, we need to get it's start epoch timestamp and end epoch timestamp as we have only epoch timestamp on the csv file. By default, javascript will return the time in milli second considering the time zone. To convert it into UTC epoch time,timezoneOffset is deducted. startTimestamp and endTimestamp are embedded inside argv.

```js
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
```

### 8. Getting the balance of token in USD from cryptocompare

I have gone through the cryptocompare API documentation where I found https://min-api.cryptocompare.com/data/price
endpoint need to be used to get the balance of token in USD. I have created free API key to make use of this endpoint in our app which I have stored in .env file. 

We need to pass three query params in this case fsym, tsyms and api_key. 

- fsym: the token name, 
- tsyms: USD as we need to token balance in USD
- api_key: the api key that we have created before in cryptocompare page.

### 9. Adding command in yargs file.

I have added `tokenInfo` command to get the information related to token. In the future, if we need any extra commands on command line program we can add those command on yargs setup and run the respective code when those command are executed with the help of switch...case program. I have list all the available command and validate that command before going to the next step.

### 10. Globally Available Commands

To make our command available globally,I add a shebang line to the top of main.js:

```shell
#!/usr/bin/env node
```

Next, bin property is added to our package.json file. This maps the command name (crpyto) to the name of the file to be executed (relative to package.json):

```json
"bin": {
"crypto": "./main.js"
}
```

After that, installing this module globally and we have a working shell command.

```shell
npm install -g
```

Now we can run our command line application using `crypto` command from any directory.

Examples:

```shell
crypto tokenInfo
```

```shell
crypto tokenInfo -t BTC
```

### 10. Loading feature is also added till we get the result from the CSV.
