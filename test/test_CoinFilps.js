const coinFlips = artifacts.require("CoinFlips");


contract("CoinFlips", function(accounts) {

    //  컨트랙트 배포자가 아니면 kill() 메소드가 실행되어서는 안된다.
    it("self-destruct should be executed by ONLY owner",  async () => {
        let instance = await coinFlips.deployed();

        try {
            // account[0]가 배포자 이므로 account[9]가 kill을 수행하면 에러가 나야 정상
            await instance.kill({from:accounts[9]});
        } catch (e) {
            var err = e;
        }
        // 에러객체이면 정상
        assert.isOk(err instanceof Error, "Anyone can kill the contract!");
    });



    //  컨트랙트에 5 ETH를 전송하면 컨트랙트의 잔액은 5 ETH가 되어야 한다.
    it("should have initial fund", async () => {
        let instance = await coinFlips.deployed();
        let tx = await instance.sendTransaction({from: accounts[9], value: web3.utils.toWei("5", "ether")});
        //console.log(tx);
        //console.log(await instance.checkHouseFund.call());
        let bal = await web3.eth.getBalance(instance.address);
        console.log(bal);
        // Wei값은 BigNum로 나오기 떄문에 String형 변환 해줘야 함
        assert.equal(web3.utils.fromWei(bal, "ether").toString(), "5", "House does not have enough fund");
    });


    //  0.1 ETH를 베팅하면 컨트랙트의 잔액은 5.1 ETH가 되어야 한다.
    it("should have normal bet", async () => {
        let instance = await coinFlips.deployed();

        const val = 0.1;
        const mask = 1; //Tails 0000 0001

        // 3번째 계정이 뒷면에 베팅을 한 것으로 테스트
        await instance.placeBet(mask, {from:accounts[3], value:web3.utils.toWei(val.toString(), "ether")});
        let bal = await web3.eth.getBalance(instance.address);
        assert.equal(await web3.utils.fromWei(bal, "ether").toString(), "5.1", "placeBet is failed");
    });


    //  플레이어는 베팅을 연속해서 두 번 할 수 없다(베팅한 후에는 항상 결과를 확인해야 한다).
    it("should have only one bet at a time", async () => {
        let instance = await coinFlips.deployed();

        const val = 0.1;
        const mask = 1; //Tails 0000 0001

        try {
            //  위의 테스트 케이스에서 한 번 베팅했으므로 결과를 확인하지 않고 베팅하면 에러가 나야함
            await instance.placeBet(mask, {from:accounts[3], value:web3.utils.toWei(val.toString(), "ether")});
        } catch (error) {
            var err = error;
        }
        assert.isOk(err instanceof Error, "Player can bet more than two");
    });

});

