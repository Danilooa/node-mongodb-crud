const ObjectId = require("mongodb").ObjectID;

function circulationRepo() {

    async function loadData(db, data) {
        try {
            return new Promise(async (resolve, reject) => {
                resolve(await db.collection('newspaper').insertMany(data));
            });
        } catch (err) {
            reject(err);
        }
    }

    async function get(db, query, limit) {
        try {
            return new Promise(async (resolve, reject) => {
                const items = db.collection('newspaper').find(query);
                if (limit == null) {
                    resolve(await items.toArray());
                } else {
                    resolve(await items.limit(limit).toArray());
                }
            });
        } catch (err) {
            reject(err);
        }
    }

    async function getById(db, idString) {
        try {
            return new Promise(async (resolve, reject) => {
                resolve(
                    db.collection('newspaper').findOne({
                        _id: ObjectId(idString)
                    })
                );
            });
        } catch (err) {
            reject(err);
        }
    }

    async function add(db, item) {
        try {
            return new Promise(async (resolve, reject) => {
                const addedItem = await db.collection('newspaper').insertOne(item);
                resolve(addedItem);
            });
        } catch (err) {
            reject(err);
        }
    }

    async function update(db, id, item) {
        try {
            return new Promise(async (resolve, reject) => {
                const updatedItem = await db.collection('newspaper').findOneAndReplace(
                    { _id: ObjectId(id) },
                    item,
                    { returnOriginal: false }
                );
                resolve(updatedItem.value);
            });
        } catch (err) {
            reject(err);
        }
    }

    async function remove(db, id) {
        try {
            return new Promise(async (resolve, reject) => {
                const result = await db.collection('newspaper').deleteOne({ _id: ObjectId(id) });
                resolve(result.deletedCount === 1);
            });
        } catch (err) {
            reject(err);
        }
    }

    async function averageFinalists(db) {
        try {
            return new Promise(async (resolve, reject) => {
                const average = await db.collection('newspaper').aggregate([{
                    $group: {
                        _id: null,
                        avgFinalists: {
                            $avg: "$Pulitzer Prize Winners and Finalists, 1990-2003",

                        }
                    }
                }]).toArray();
                resolve(average[0].avgFinalists);
            });
        } catch (err) {
            reject(err);
        }
    }

    async function averageFinalistsByChange(db) {
        try {
            return new Promise(async (resolve, reject) => {
                const average = await db.collection('newspaper').aggregate([
                    {
                        $project: {
                            "Newspaper": 1,
                            "Pulitzer Prize Winners and Finalists, 1990-2003": 1,
                            "Change in Daily Circulation, 2004-2013": 1,
                            overallChange: {
                                $cond: {
                                    if: { $gte: ["$Change in Daily Circulation, 2004-2013", 0] },
                                    then: 'positive',
                                    else: 'negative'
                                }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$overallChange",
                            avgFinalists: {
                                $avg: "$Pulitzer Prize Winners and Finalists, 1990-2003",
                            }
                        }
                    }
                ]).toArray();
                resolve(average);
            });
        } catch (err) {
            reject(err);
        }
    }

    return {
        loadData,
        get,
        getById,
        add,
        update,
        remove,
        averageFinalists,
        averageFinalistsByChange
    };
}

module.exports = circulationRepo();
