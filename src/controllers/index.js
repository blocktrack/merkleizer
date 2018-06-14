let express = require('express'),
    router = express.Router();

//Load controllers
let Server = require('./ServerCtrl');
let Transaction = require('./TxCtrl.js');

//Caching
let apicache = require('apicache'),
    redis = require('redis'),
    redis_config = require('../config/redis.js'),
    cache = apicache
    .options({
        redisClient: (redis_config.enabled)?redis.createClient(redis_config.config):undefined
    })
    .middleware;

//Define cache rules to only cache if result was successfull
const onlyStatus200 = (req, res) => res.statusCode === 200,
      longCacheSuccess = cache('5 minutes', onlyStatus200),
      mediumCacheSuccess = cache('1 minutes', onlyStatus200),
      shortCacheSuccess = cache('20 seconds', onlyStatus200);

router.get('/info', shortCacheSuccess, Server.info);
router.get('/latestwork/:worker', Transaction.latestWork);
router.post('/setwork/:worker/:nonce', Transaction.setWork);
router.get('/getwork/:worker/:nonce', Transaction.getWork);
router.post('/submitwork/:worker/:nonce', Transaction.submitWork);
router.post('/tx', Transaction.add);
router.get('/tx/:hash', Transaction.get);

exports.routes = router;
