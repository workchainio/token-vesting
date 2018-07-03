const FutureVestingSchedule = artifacts.require("FutureVestingSchedule");

contract("FutureVestingSchedule", function ([owner, alice]) {
    let instance;
    beforeEach('setup contract for each test', async function () {
        instance = await FutureVestingSchedule.new(50,100);
    });
    it('allows owner to update start', async function () {
        var timestamp = Math.round((new Date()).getTime() / 1000);
        assert.notEqual(timestamp, await instance.start());
        assert.ok(await instance.setStart(timestamp));
        assert.equal(timestamp, await instance.start());
    });
    it('prevents others from updating start', async function () {
        var timestamp = Math.round((new Date()).getTime() / 1000);
        try{
            await instance.setStart(timestamp, {from: alice});
        }
        catch(error)
        {
            //Check to make sure this isn't some other random error
            const vmException = error.message.search('VM Exception') >= 0;
            assert(vmException, "Expected VM Exception, got '" + error + "' instead");
            return;
        }
        assert.fail("Unauthorized user was not prevented from setting the vesting start time.");
    });
});