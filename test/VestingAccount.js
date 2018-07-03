const WorkToken = artifacts.require("WorkToken");
const bonusAmount = web3.toBigNumber(5000).mul(10**18);
const VestingAccount = artifacts.require("VestingAccount");
const FutureVestingSchedule = artifacts.require("FutureVestingSchedule");

contract("VestingAccount", function ([workchain, bonusBeneficiery]) {
    let schedule;
    let workToken;
    let vestingAccount;
    beforeEach('setup contract for each test', async function () {
        //Create the WorkToken contract
        workToken = await WorkToken.new();
        //Create a vesting schedule whose start time is initially set to the year 3000 but can be updated in the future
        //cliff=5, duration=10
        schedule = await FutureVestingSchedule.new(5,10);
        //Create a vesting account
        vestingAccount = await VestingAccount.new(bonusBeneficiery, schedule.address, false);
    })
    it('allows workchain to transfer bonus tokens to beneficiery vesting account', async function () {
        assert.ok(await workToken.transfer(vestingAccount.address, bonusAmount));
        assert.equal(bonusAmount.toNumber(), (await workToken.balanceOf(vestingAccount.address)).toNumber());
    });
    it('doesent vest any tokens during cliff', async function () {
        //Transfer some tokens to vesting account
        assert.ok(await workToken.transfer(vestingAccount.address, bonusAmount));
        assert.equal(bonusAmount, (await workToken.balanceOf(vestingAccount.address)).toNumber());
        //Check that no tokens have vested during cliff
        assert.equal(0, await vestingAccount.releasableAmount(workToken.address, {from: bonusBeneficiery}));
    });
    it('prevents bonusBeneficiery from releasing tokens during cliff', async function () {
        //Transfer some tokens to vesting account
        assert.ok(await workToken.transfer(vestingAccount.address, bonusAmount));
        assert.equal(bonusAmount.toNumber(), (await workToken.balanceOf(vestingAccount.address)).toNumber());
        try{
            await vestingAccount.release(workToken.address, {from: bonusBeneficiery});
        }
        catch(error){
            //Check to make sure this isn't some other random error
            const vmException = error.message.search('VM Exception') >= 0;
            assert(vmException, "Expected VM Exception, got '" + error + "' instead");
            return;
        }
        assert.fail("Release of tokens during cliff period was not prevented.");
    });
    it('vests all tokens if start+cliff+duration has expired', async function () {
        assert.ok(await workToken.transfer(vestingAccount.address, bonusAmount));
        assert.equal(bonusAmount.toNumber(), (await workToken.balanceOf(vestingAccount.address)).toNumber());

        //Now set the start date of the future vesting schedule to a time in the past (NOW - 16sec)
        start = Math.round((new Date()).getTime() / 1000)-16;
        assert.ok(schedule.setStart(start));

        //All tokens should be vested now
        assert.equal(bonusAmount.toNumber(), (await vestingAccount.releasableAmount(workToken.address, {from: bonusBeneficiery})).toNumber());
        await vestingAccount.release(workToken.address, {from: bonusBeneficiery});
        assert.equal(bonusAmount.toNumber(), (await workToken.balanceOf(bonusBeneficiery)).toNumber());
    });
});