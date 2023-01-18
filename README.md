# ton-template
Template repository for minimal setup to test TON funC smart contracts.

This template uses the following libraries:
- `ton-contract-executor`: run as the local TVM.
- `func-js`: used to compile the funC smart contract.

## Setup

```
# install dependencies
npm i

# run the test
npx ts-mocha -p tsconfig.json --exit <:test-file.tx>
```

## Warning
the `ton` package is locked to version `12.3.3`. The `ton-contract-executor` is not compatible with version `>= 13.0.0` (see: [issue](https://github.com/ton-community/ton-contract-executor/issues/12)).

## Debug

You can add `~dumps(xxx)` to let the smart contract output debug values to the log ([link](https://answers.ton.org/question/1485657602909016064/how-can-you-debug-a-ton-smart-contract-in-func-and-print-logs-or-dump-variables?sortby=newest)):

After the `~dumps(xxx)`, you can use the `send.logs` the following to print the transaction log:
```ts
const send = await contract.sendInternalMessage(
    new InternalMessage({
        // ... skip here for demo purpose
    })
);

// print the logs of the transactions to debug.
console.log(send.logs);
```

Note that the smart contract instance must be created with the debug flag set to true. Otherwise, the `~dumps()` will be ignored:
```ts
contract = await SmartContract.fromCell(
    codeCell, // code
    beginCell().endCell(), // init data
    {debug: true} // <-- set the debug flag
);
```
