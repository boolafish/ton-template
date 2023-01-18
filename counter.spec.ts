import chai, { expect } from "chai";
import chaiBN from "chai-bn";
import BN from "bn.js";

import { Address, beginCell, Cell, InternalMessage, CommonMessageInfo, CellMessage } from "ton";
import { SmartContract } from "ton-contract-executor";
import { compileFunc, compilerVersion } from '@ton-community/func-js';
import { readFileSync } from "fs";
import Prando from "prando";

const zeroAddress = new Address(0, Buffer.alloc(32, 0));

chai.use(chaiBN(BN));

function randomAddress(seed: string, workchain?: number) {
    const random = new Prando(seed);
    const hash = Buffer.alloc(32);
    for (let i = 0; i < hash.length; i++) {
        hash[i] = random.nextInt(0, 255);
    }
    return new Address(workchain ?? 0, hash);
}

describe("Counter tests", () => {
  let contract: SmartContract;
  const INIT_NUM = 100;
  const COUNT_OP = 1;

  beforeEach(async () => {
    // You can get compiler version
    let version = await compilerVersion();
    console.log("compiler version: ", version);

    let result = await compileFunc({
        targets: ['counter.fc'],
        sources: {
            'counter.fc': readFileSync(__dirname + '/counter.fc').toString(),
            // add the dependencies with the #include "<:dep.fc>" inside the main target
            'stdlib.fc': readFileSync(__dirname + '/stdlib.fc').toString(),
        }
    });

    if (result.status === 'error') {
        console.error(result.message)
        return;
    }

    // result.codeBoc contains base64 encoded BOC with code cell
    let codeCell = Cell.fromBoc(Buffer.from(result.codeBoc, "base64"))[0];
    contract = await SmartContract.fromCell(
        codeCell,
        // initialize the counter value
        beginCell().storeUint(INIT_NUM, 64).endCell(),
        // turn on the debug mode
        {debug: true}
    );

    // result.fiftCode contains assembly version of your code (for debug purposes)
    console.log(result.fiftCode);
  });

  it("should be able to add the counter", async () => {
    const send = await contract.sendInternalMessage(
        new InternalMessage({
            from: randomAddress("sender"),
            to: zeroAddress,
            value: 0,
            bounce: true,
            body: new CommonMessageInfo({
                body: new CellMessage(
                    beginCell().storeUint(COUNT_OP, 32).endCell()
                ),
            })
        })
    );
    expect(send.type).to.equal("success");

    const res = await contract.invokeGetMethod('counter', []);
    const counter = res.result[0];
    expect(counter.toString()).to.equal((new BN(INIT_NUM+1)).toString());
  });
});
