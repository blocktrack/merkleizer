<p align="center">
  <a href="https://www.blocktrack.net/">
  <h1 align="center">Blocktrack API</h1>
  </a>
  Merkleizing API for the blocktrack service
</p>

# How to use
The easiest way to startup the services is using docker compose. It will automaticlly download and start all dependencies. An example setup you can find in setup folder.

# Configuration

The best way to configure your worker(s) is using environment variable. You can also use the configuration file in the config folder.

| Environment variable | Description      |    Default |
| ---                  | ---              |        --- |
| HTTP_PORT            | Listening port   |         80 |
| MONGO_HOST           | Mongodb host     |  127.0.0.1 |
| MONGO_PORT           | MongoDB port     |      27017 |
| MONGO_NAME           | Name of database | blocktrack |
| REDIS_HOST           | Redis host       |  127.0.0.1 |
| REDIS_PORT           | Redis port       |       6379 |
| REDIS_PASS           | Redis password   |            |

# What to use Blockrack for and when to use it

Blocktrack is an opensource framework that helps you to blockchain your database without headache. Blocktrack syncs a shadow of your database records to enable you or your customers to verify the integrity of your database records.

Privacy is always guaranteed because only hashes of your data leave your database. Also duplicate records result will always result in different hashes because the hash calculation always depend on the previous records hash.

## Shadowing
As a shadow of your database we define as new database table that holds a serialized representation of a database model that you later want to have protected. You dont have to include all your database tables and records to your shadow.

Take an online shop as an example. You might only want to create a shadow for all purchase orders. So you can create 2 shadow tables for each case and add a new record to the shadow if a new purchase order gets created or canceled. Also you should only add the properties to the shadow that you really need.

## Grouping
To reduce the number of blockchain transactions and improve the speed the shadow hashes get grouped as a package. The data structure is a merkle tree that holds shadowed data as its leaves

Only the merkle root gets written out to the blockchain as an “anchor” transaction.

## Verification
Given the hash of the shadow, the data that generated the hash, the hash path to the merkle root and the anchor transaction it is possible to recreate and validate the shadow hash, follow the merkle path and compare the anchor transaction. If the anchor transaction contains the merkle root it is a mathematical proof that the data has not been manipulated after the anchor transaction has been written out to the blockchain.

Also the block of the anchor transaction will enable you to check the time of the blockchain sync. If the sync happens on a regular basis it adds an independend chronology to your data that lets you prove that you havent recently recreated a manipulated history.

## Customer check
If you want to enable your customer to verify his transaction you just need to provide the customer with the data from the verification process. In this case you will benefit from a good shadow model because you will be able to let the user fillout some inputs of the hash calculation and give the user a positive feedback if the resulting hash matches.
