'use strict';

//Load Models
var Message = require('../models/message.js');
var Transaction = require('../models/transaction');
var merkle = require('merkle');
const crypto = require('crypto');


exports.add = add;
exports.get = get;
exports.submitWork = submitWork;
exports.getWork = getWork;
exports.setWork = setWork;
exports.latestWork = latestWork;

/**
 * Get transaction for given hash.
 * @param {} req
 * @param {} res
 */
function add(req, res) {
    var hash = req.body.hash;
    var script = req.body.script;
    console.info('recived data ' + hash + ' ' + script);
    Transaction.add(hash, script)
        .then((tx) => res.json(Message(1, undefined, tx)))
        .catch((error) => res.status(404).json(Message(0, error.message)));
};

function get(req, res) {
    var hash = req.params.hash;
    var chain = (req.query.chain) ? req.query.chain : 'bitcoin';
    Transaction.get(hash)
        .then((tx) => {
            if (tx.worker == undefined || tx.worker[chain] == undefined)
                return {
                    hash: tx.hash,
                    script: tx.script,
                    path: null,
                    tx_id: null
                };
            return Transaction.getWork(chain, tx.worker[chain].nonce)
                .then((txs) => {
                    let i = null,
                        arr = [];
                    txs.forEach((e, index) => {
                        arr.push(e.hash);
                        if (e.hash == hash) {
                            i = index;
                        }
                    });
                    if (i == null) throw Error('ERR_NO_PATH');
                    else {
                        return {
                            hash: tx.hash,
                            script: tx.script,
                            path: formatPath(merkle('sha256', false).sync(arr).getProofPath(i), tx.hash),
                            tx_id: tx.worker[chain].tx
                        };
                    }
                });
        })
        .then((tx) => res.json(Message(1, undefined, tx)))
        .catch((error) => res.status(404).json(Message(0, error.message)));
};

function submitWork(req, res) {
    var worker = req.params.worker;
    var nonce = parseInt(req.params.nonce);
    var tx = req.body.tx;
    Transaction.submitWork(worker, nonce, tx)
        .then((data) => res.json(Message(1, 'SUC_SUBMIT')))
        .catch((error) => res.status(404).json(Message(0, error.message)));
};

function getWork(req, res) {
    var worker = req.params.worker;
    var nonce = parseInt(req.params.nonce);
    console.info('worker ' + worker + ' get work ' + nonce);
    Transaction.getWork(worker, nonce)
        .then((work) => getTree(work)
            .then((hash) => res.json(Message(1, undefined, {
                work: hash.root(),
                anchor: work[0].worker[worker].tx
            })))
        )
        .catch((error) => res.status(404).json(Message(0, error.message)));
};


function setWork(req, res) {
    var worker = req.params.worker;
    var nonce = parseInt(req.params.nonce);
    console.info('worker ' + worker + ' set work ' + nonce);
    Transaction.nonceExists(worker, nonce)
        .then(() => Transaction.setWork(worker, nonce))
        .then(() => Transaction.getWork(worker, nonce))
        .then((work) => getTree(work))
        .then((hash) => res.json(Message(1, undefined, hash.root())))
        .catch((error) => res.status(404).json(Message(0, error.message)));
};

function latestWork(req, res) {
    var worker = req.params.worker;
    console.info('worker ' + worker + ' get latest work ');
    Transaction.latestWork(worker)
        .then((work) => res.json(Message(1, undefined, work)))
        .catch((error) => res.status(404).json(Message(0, error.message)));
};

function getTree(work) {
    return new Promise((resolve, reject) => {
        if (work.length) {
            let arr = [];
            work.forEach((e) => arr.push(e.hash));
            resolve(merkle('sha256', false).sync(arr));
        } else {
            reject(Error('ERR_CANT_SEE_NO_TREE'));
        }
    });
}

function formatPath(path, hash) {
    var steps = [{
        op: 'sha256',
        params: [hash],
        res: crypto.createHash('sha256').update(hash).digest().toString('hex')
    }];
    let tmp = steps[0].res;
    path.forEach(step => {
        if (step.left == tmp) {
            steps.push({
                op: 'append',
                params: [step.right],
                res: tmp + step.right
            });
        } else if (step.right == tmp) {
            steps.push({
                op: 'prepend',
                params: [step.lefft],
                res: step.left + tmp
            });
        } else {
            throw Error('Cant format tree path');
        }
        tmp = crypto.createHash('sha256').update(steps[steps.length - 1].res).digest().toString('hex');
        steps.push({
            op: 'sha256',
            params: [steps[steps.length - 1].res],
            res: tmp
        });
    });
    return steps;
}
