var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import UserModel from '../models/user';
import * as utils from '../config/utils';
import * as wallet from '../config/wallet';
import txModel from '../models/transaction';
import web3 from '../config/web3';
import Contract from '../classes/Contract';
import logger from '../config/winston';
module.exports.create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield UserModel.create({
            username: req.body.newUserName,
            email: req.body.newUserEmail,
            type: req.body.userType
        });
        logger.info(`User ${db._id} created {"email":${req.body.newUserEmail}}`);
        res.status(200).json({ userID: db._id });
    }
    catch (e) {
        logger.error(`User ${req.body.newUserEmail} Creation didn't worked out `, {
            message: e.message
        });
        res.status(400).json({ error: e.message });
    }
});
module.exports.confirm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let user;
    try {
        const user = yield UserModel.findOne({
            _id: req.params.id,
            address: null
        });
        const mnemonic = wallet.generateMnemonic();
        const newPrivateKey = yield wallet.generatePrivateKeyFromMnemonic({
            mnemonic,
            coin: process.env.DERIVATIONPATHCOIN
        });
        const encryptedNewPrivateKey = wallet.encryptBIP38(newPrivateKey, req.body.passphrase);
        const newAddress = wallet.generateRSKAddress(newPrivateKey);
        const { address, privateKey } = yield utils.getKeys({
            email: process.env.ADMINEMAIL,
            passphrase: process.env.ADMINPASSPHRASE
        });
        const contract = new Contract({ privateKey });
        const txHash = yield contract.sendDataToContract({
            fromAddress: address,
            method: 'createUser',
            data: [newAddress, user.type, utils.asciiToHex(user.username)]
        });
        yield utils.createPendingTx({
            txHash,
            subject: 'add-user',
            data: [user.username, user.type, newAddress]
        });
        const db = yield UserModel.findByIdAndUpdate(req.params.id, {
            address: newAddress,
            encryptedPrivateKey: encryptedNewPrivateKey
        }, { new: true });
        logger.info(`User ${user._id} confirmed {"address":${newAddress}}`);
        res.json({
            username: db.username,
            email: db.email,
            mnemonic,
            address: db.address,
            txHash
        });
    }
    catch (e) {
        logger.error(`User Confirmation ${user._id}`, { message: e.message });
        res.status(500).json({ error: e.message });
    }
});
export const restore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let user;
    try {
        const newPrivateKey = yield wallet.generatePrivateKeyFromMnemonic({
            mnemonic: req.body.mnemonic,
            coin: process.env.DERIVATIONPATHCOIN
        });
        const newEncryptedPrivateKey = wallet.encryptBIP38(newPrivateKey, req.body.newPassphrase);
        const newAddress = wallet.generateRSKAddress(newPrivateKey);
        user = yield UserModel.findOneAndUpdate({ address: newAddress }, {
            encryptedPrivateKey: newEncryptedPrivateKey
        }, { new: true });
        if (!user) {
            throw Error('No user with this mnemonic');
        }
        logger.info(`User ${user._id} restored with mnemonic passphrase`);
        res.json(user);
    }
    catch (e) {
        logger.error(`User ${user._id} not able to restore with mnemonic passphrase`, { message: e.message });
        res.status(400).json({ error: e.message });
    }
});
module.exports.change = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let user;
    try {
        const user = yield UserModel.findOne({
            email: req.body.email,
            address: { $ne: null }
        });
        const decryptedKey = yield wallet.decryptBIP38(user.encryptedPrivateKey, req.body.passphrase);
        const encryptedPrivateKey = wallet.encryptBIP38(decryptedKey, req.body.newPassphrase);
        yield UserModel.findByIdAndUpdate(user._id, {
            encryptedPrivateKey
        });
        logger.info(`User ${user._id} changed passphrase`);
        res.sendStatus(200);
    }
    catch (e) {
        logger.error(`User ${user._id} not able to restore with mnemonic passphrase`, { error: e.message });
        res.status(400).json({ error: e.message });
    }
});
module.exports.get = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contract = new Contract();
        const contractUsers = yield contract.getDataFromContract({
            method: 'getAllUsers'
        });
        yield txModel.deleteMany({ data: { $in: contractUsers } });
        const pendingUser = yield txModel.aggregate([
            {
                $match: {
                    subject: 'add-user'
                }
            },
            {
                $group: {
                    _id: null,
                    result: { $push: { $arrayElemAt: ['$data', 2] } }
                }
            }
        ]);
        const allUsers = Object.values(contractUsers).concat(pendingUser.length > 0 ? pendingUser[0]['result'] : []);
        const allUsersDetails = allUsers.map((address) => __awaiter(void 0, void 0, void 0, function* () {
            const details = yield contract.getDataFromContract({
                method: 'getUserDetails',
                data: [address]
            });
            return {
                name: utils.hexToAscii(details[0]),
                type: details[1],
                status: details[2],
                address
            };
        }));
        Promise.all(allUsersDetails).then(userDetails => {
            res.json(userDetails);
        });
    }
    catch (e) {
        console.log(e);
        logger.error(`Couldn't retrieve userList`, { message: e.message });
        res.status(500).json({ error: e.message });
    }
});
module.exports.getBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        web3.eth.getBalance(req.params.address).then(balance => {
            res.json(web3.utils.fromWei(balance));
        });
    }
    catch (e) {
        logger.error(`Couldn't get balance of ${req.params.address} `, {
            message: e.message
        });
        res.sendStatus(500);
    }
});
module.exports.close = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { address, privateKey } = yield utils.getKeys(req.body);
        const contract = new Contract({ privateKey });
        const txHash = yield contract.sendDataToContract({
            fromAddress: address,
            method: 'changeUserStatus',
            data: [req.params.address]
        });
        logger.info(`Paused User ${req.params.address}`);
        res.json(txHash);
    }
    catch (e) {
        logger.error(`Couldn't pause User ${req.params.address}`, {
            message: e.message
        });
        res.status(400).json({ error: e.message });
    }
});
module.exports.getOne = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const address = utils.toChecksumAddress(req.params.address);
        const contract = new Contract();
        yield UserModel.findOneAndUpdate({ address }, { status: true });
        const userDetails = yield contract.getDataFromContract({
            method: 'getUserDetails',
            data: [address]
        });
        const projects = yield contract.getDataFromContract({
            method: userDetails[1] == 0 ? 'getClientProjects' : 'getSupplierProjects',
            data: [address]
        });
        let response = [];
        let balance = yield web3.eth.getBalance(address);
        for (let i = 0; i < projects.length; i++) {
            let projectDetails = yield contract.getDataFromContract({
                method: 'getProjectDetails',
                data: [projects[i]]
            });
            response.push({
                title: utils.hexToAscii(projectDetails[2]),
                expediente: projects[i],
                oc: utils.hexToAscii(projectDetails[3])
            });
        }
        res.json({
            userName: utils.hexToAscii(userDetails[0]),
            balance: web3.utils.fromWei(balance),
            type: userDetails[1],
            status: userDetails[2],
            proyectos: response
        });
    }
    catch (e) {
        logger.error(`Couldn't get user details ${req.params.address}`, {
            message: e.message
        });
        res.status(500).json({ error: e.message });
    }
});
//# sourceMappingURL=UserController.js.map