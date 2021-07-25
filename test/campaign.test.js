const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledfactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts;
let factory;
let campaign;
let campaignAddress;

beforeEach(async () => {

    accounts = await web3.eth.getAccounts();

    factory = await new web3.eth.Contract(JSON.parse(compiledfactory.interface))
        .deploy({ data: compiledfactory.bytecode })
        .send({ from: accounts[0], gas: '1000000' });

    await factory.methods.createCampaign('100')
        .send({ from: accounts[0], gas: '1000000' });

    [campaignAddress] = await factory.methods.getDeployedCampaigns().call();

    campaign = await new web3.eth.Contract(
        JSON.parse(compiledCampaign.interface),
        campaignAddress
    );
});

describe('Camgaign', () => {

    it('Deploys a campaign and a factory', () => {

        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });

    it('marks caller as the campaign manager', async () => {

        const manager = await campaign.methods.manager().call();
        assert.strictEqual(accounts[0], manager);
    });

    it('allows people to contribute money and add them as approvers', async () => {

        await campaign.methods.contribute().send({

            value: '200',
            from: accounts[1]
        });

        const isContributer = await campaign.methods.approvers(accounts[1]).call();
        assert.ok(isContributer);
    });

    it('requires a min. contribution', async () => {

        try {

            await campaign.methods.contribute().send({

                value: '5',
                from: accounts[1]
            });

            assert(false);

        } catch (error) {

            assert(error);
        }
    });

    it('allows manager to make payment request', async () => {

        await campaign.methods
            .createRequest('Buy screens', '100', accounts[1]).send({

                from: accounts[0],
                gas: '1000000'
            });

        const request = await campaign.methods.requests(0).call();

        assert.strictEqual('Buy screens', request.description);
    });
});















