const MongoClient = require("mongodb").MongoClient;
const assert = require('assert');
const data = require("./data/circulation.json");
const circulationRepo = require("./repos/circulationRepo");

const host = "localhost";
const port = "27017";
const dbName = "circulation";
const user = "mongo";
const pass = "mongo";
const url = "mongodb://" + user + ":" + pass + "@" + host + ":" + port;

async function main() {
    const client = new MongoClient(url, { useUnifiedTopology: true });
    await client.connect();
    const db = client.db(dbName);

    await circulationRepo.loadData(db, data);

    console.log("=================> get <===================");
    const newspapers = await circulationRepo.get(
        db,
        { 'Pulitzer Prize Winners and Finalists, 1990-2014': 2 },
        2
    );
    console.log(newspapers);

    console.log("============> findOne by id_ <============");
    const newspaperById = await circulationRepo.getById(
        db,
        newspapers[0]._id.toString()
    );
    console.log(newspaperById);

    console.log("==================> add <=================");
    const newItem = {
        "Newspaper": "Osasco News",
        "Daily Circulation, 2004": 15,
        "Daily Circulation, 2013": 100,
        "Change in Daily Circulation, 2004-2013": 5,
        "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
        "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
        "Pulitzer Prize Winners and Finalists, 1990-2014": 0
    };
    const addedItem = await circulationRepo.add(db, newItem);
    console.log(addedItem);
    const persistedItem = await circulationRepo.getById(db, addedItem.ops[0]._id.toString());
    assert.deepStrictEqual(addedItem.ops[0], persistedItem);

    console.log("================> update <=================");

    const itemUpdate = {
        "Newspaper": "ZO News",
        "Daily Circulation, 2004": 1,
        "Daily Circulation, 2013": 10,
        "Change in Daily Circulation, 2004-2013": 1,
        "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
        "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
        "Pulitzer Prize Winners and Finalists, 1990-2014": 0
    };
    const updatedItem = await circulationRepo.update(
        db,
        addedItem.ops[0]._id.toString(),
        itemUpdate
    );
    const updatedItemFound = await circulationRepo.getById(db, updatedItem._id.toString());
    console.log('found: "' + updatedItemFound.Newspaper + '" uptated: "' + updatedItem.Newspaper + '"');

    console.log("================> remove <=================");
    const wasRemoved = await circulationRepo.remove(db, updatedItem._id.toString());
    const removedItem = await circulationRepo.getById(db, updatedItem._id.toString());
    console.log('Was the item removed ? ' + wasRemoved + " " + removedItem);
    
    console.log("===============> average <=================");
    const avgFinalists = await circulationRepo.averageFinalists(db);
    console.log('Average = ' + avgFinalists);

    console.log("=============> projection <================");
    const projection = await circulationRepo.averageFinalistsByChange(db);
    console.log("_id: " + projection[0]._id + ", avgFinalists: " + projection[0].avgFinalists);
    console.log("_id: " + projection[1]._id + ", avgFinalists: " + projection[1].avgFinalists);

    await client.db(dbName).dropDatabase();

    client.close();
}

main();