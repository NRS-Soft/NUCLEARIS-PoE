/* eslint-disable no-await-in-loop */
/* eslint-disable no-undef */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable node/no-unpublished-require */

const NuclearPoE = artifacts.require('../contracts/NuclearPoE.sol');
const Process = artifacts.require('../contracts/Process.sol');
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');
const web3 = require('web3');

contract('Create Project', accounts => {
  let instance;
  before(async () => {
    instance = await NuclearPoE.deployed();
  });
  it('EVENT: Create a new project', async () => {
    await instance.createUser(accounts[1], 0, web3.utils.asciiToHex('NA-SA'));
    const result = await instance.createProject(
      41955,
      accounts[1],
      web3.utils.asciiToHex('Conjunto Soporte'),
      web3.utils.asciiToHex('23423423 / 23423423')
    );

    truffleAssert.eventEmitted(result, 'CreateProject');
  });

  it('REVERT: Create duplicate project', async () => {
    await truffleAssert.reverts(
      instance.createProject(
        41955,
        accounts[1],
        web3.utils.asciiToHex('Conjunto Soporte'),
        web3.utils.asciiToHex('23423423 / 23423423')
      ),
      'Project already created'
    );
  });
  it('REVERT: Create project with non-existing User', async () => {
    await truffleAssert.reverts(
      instance.createProject(
        54322,
        accounts[4],
        web3.utils.asciiToHex('Conjunto Soporte'),
        web3.utils.asciiToHex('23423423 / 23423423')
      ),
      'User does not exist'
    );
  });
  it('REVERT: Create new project as non-owner', async () => {
    await truffleAssert.reverts(
      instance.createProject(
        41955,
        accounts[1],
        web3.utils.asciiToHex('Conjunto Soporte'),
        web3.utils.asciiToHex('23423423 / 23423423'),
        { from: accounts[1] }
      ),
      'Ownable: caller is not the owner.'
    );
  });
});

contract('Return Projects', accounts => {
  let instance;
  before(async () => {
    instance = await NuclearPoE.deployed();
    await instance.createUser(accounts[1], 0, web3.utils.asciiToHex('NA-SA'));
    await instance.createUser(accounts[2], 1, web3.utils.asciiToHex('IMECO'));
    await instance.createProject(
      41955,
      accounts[1],
      web3.utils.asciiToHex('Conjunto Soporte'),
      web3.utils.asciiToHex('23423423 / 23423423')
    );
    await instance.createProject(
      41800,
      accounts[1],
      web3.utils.asciiToHex('Anillos 2019'),
      web3.utils.asciiToHex('23423423 / 23423423')
    );
  });
  it('Return projects contracts', async () => {
    const result = await instance.getAllProjects();
    assert.lengthOf(result, 2, 'Result should be array of 2 projects');
  });
});

contract('Close Project', accounts => {
  let instance;
  before(async () => {
    instance = await NuclearPoE.deployed();
    await instance.createUser(accounts[1], 0, web3.utils.asciiToHex('NA-SA'));
    await instance.createUser(accounts[2], 1, web3.utils.asciiToHex('IMECO'));
    await instance.createProject(
      41955,
      accounts[1],
      web3.utils.asciiToHex('Conjunto Soporte'),
      web3.utils.asciiToHex('23423423 / 23423423')
    );
    await instance.createProject(
      41956,
      accounts[1],
      web3.utils.asciiToHex('Conjunto Soporte'),
      web3.utils.asciiToHex('23423423 / 23423423')
    );
  });

  it('EVENT: Close Project', async () => {
    const result = await instance.changeProjectStatus(41955, {
      from: accounts[0]
    });
    truffleAssert.eventEmitted(result, 'CloseProject');
  });
  it('REVERT: Close non existant Project', async () => {
    await truffleAssert.reverts(
      instance.changeProjectStatus(12333, {
        from: accounts[0]
      }),
      'Project does not exist or is already closed'
    );
  });
  it('REVERT: Close already closed Project', async () => {
    await instance.changeProjectStatus(41956, {
      from: accounts[0]
    });
    await truffleAssert.reverts(
      instance.changeProjectStatus(41956, {
        from: accounts[0]
      }),
      'Project does not exist or is already closed'
    );
  });
});

contract('Doc Number', accounts => {
  let instance;
  let processAddress;
  before(async () => {
    instance = await NuclearPoE.deployed();
    await instance.createUser(accounts[1], 0, web3.utils.asciiToHex('NA-SA'));
    await instance.createUser(accounts[2], 1, web3.utils.asciiToHex('IMECO'));
    await instance.createProject(
      41955,
      accounts[1],
      web3.utils.asciiToHex('Conjunto Soporte'),
      web3.utils.asciiToHex('23423423 / 23423423')
    );
    const result = await instance.createProcess(
      accounts[2],
      web3.utils.asciiToHex('Mecanizado')
    );

    processAddress = result.logs[0].args[0];
    processInstance = await Process.at(processAddress);
  });
  it('Get Doc Number', async () => {
    const result = await instance.docNumber();
    assert(result, 0);
  });
});