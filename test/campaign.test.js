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
});


