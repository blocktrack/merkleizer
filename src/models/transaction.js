'use strict';

//Set up database
var mongo = require('../libraries/mongo.js');

exports.add = add;
exports.get = get;
exports.nonceExists = nonceExists;
exports.getWork = getWork;
exports.setWork = setWork;
exports.submitWork = submitWork;
exports.latestWork = latestWork;

/**
 * Add new tx
 * @param {string} hash
 * @param {string} script
 * @returns {} 
 */
function add(hash, script) {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('tx').insert({
                    "hash": hash,
                    "script": script
                }, (err, docs) => {
                    if (err && err.code == 11000) {
                        reject(Error("ERR_DUPLICATE_TX"));
                    } else if (err) {
                        console.error(err);
                        reject(Error("ERR_INSERT_TX"));
                    } else
                        resolve(docs);
                });
            });
    });
}

function get(hash) {
    return mongo.connect()
        .then((db) => {
            let descriptor = {
                hash: hash
            };
            return db.collection('tx').findOne(descriptor).then(tx=>{
                if(tx) return tx
                throw Error('ERR_TRANSACTION_NOT_FOUND');
            });
        })
        .catch(error => {
            console.error(error);
            throw Error("ERR_GET_TX");
        });
}

function setWork(worker, nonce) {
    return mongo.connect()
        .then((db) => {
            let descriptor = {};
            descriptor['worker.' + worker] = null;
            let update = {
                '$set': {}
            };
            update["$set"]['worker.' + worker + '.nonce'] = nonce;
            update['$set']['worker.' + worker + '.nonce'] = nonce;
            return db.collection('tx').updateMany(descriptor, update);
        })
        .catch(error => {
            console.error(error);
            throw Error("ERR_SET_WORK");
        });
}

function nonceExists(worker, nonce, throwOnError = true) {
    return getWork(worker, nonce)
        .then((work) => {
            if (throwOnError && work.length) throw Error('ERR_NONCE_EXISTS');
            return work.length>0;
        });
}

function submitWork(worker, nonce, tx) {
    return mongo.connect()
        .then((db) => {
            let descriptor = {};
            descriptor['worker.' + worker + '.nonce'] = nonce;
            descriptor['worker.' + worker + '.tx'] = null;
            let update = {
                '$set': {}
            };
            update["$set"]['worker.' + worker + '.tx'] = tx;
            return db.collection('tx').updateMany(descriptor, update);
        })
        .then(data=>{
            if (data.modifiedCount == 0) {
                throw Error('ERR_NOTHING_TO_SUBMIT');
            }
            return data;
        })
        .catch(err=>{
            console.error(err);
            throw Error("ERR_SUBMIT_WORK");
        });
}

function latestWork(worker) {
    let sort = {};
    sort['worker.' + worker+'.nonce'] = -1;
    let descriptor = {};
    descriptor['worker.' + worker+ '.nonce'] = {"$gt": 0};
    return mongo.connect()
        .then(db=>db.collection('tx'))
        .then(collection=>collection.find(descriptor).sort(sort).limit(1).toArray())
        .then(txs=>(txs.length)?txs[0].worker[worker]:null);
}

function getWork(worker, nonce) {
    return mongo.connect()
        .then((db) => {
            let descriptor = {};
            descriptor['worker.' + worker + '.nonce'] = nonce;
            return db.collection('tx').find(descriptor);
        })
        .then(cursor=>cursor.toArray())
        .catch(err=>{
            console.error(err);
            throw Error("ERR_FETCH_WORK");
        });
}
