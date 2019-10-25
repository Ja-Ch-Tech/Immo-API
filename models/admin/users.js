var db = require("../db");

var collection = {
    value: null
}

module.exports.initialize = (db) => {

    collection.value = db.get().collection("users");
}

/**
 * Module de comptage des utilisateurs
 */
module.exports.countUsers = (id_admin, callback) => {
    try {
        var admin = require("./admin");

        admin.initialize(db);
        admin.findOneById(id_admin, (isFound, message, resultFound) => {
            if (isFound) {

                collection.value.aggregate([
                    {
                        "$match": {}
                    },
                    {
                        "$group": {
                            "_id": {
                                "type": "$type"
                            },
                            "count": { "$sum": 1 }
                        }
                    }
                ]).toArray((err, resultAggr) => {
                    if (err) {
                        callback(false, "Une erreur est survenue lors du comptage par type d'utilisateur : " + err)
                    } else {
                        if (resultAggr.length > 0) {
                            var obj = {
                                    "details": [],
                                    "total": 0
                                },
                                sortie = 0,
                                type_user = require("../type_users");

                            type_user.initialize(db);
                            resultAggr.map((value, index, tab) => {
                                type_user.getIntituleForAdmin(value, (isGet, message, resultWithIntitule) => {
                                    sortie++;

                                    if (isGet) {
                                        obj.details.push(resultWithIntitule);
                                        obj.total += resultWithIntitule.count;
                                    }

                                    if (sortie == tab.length) {
                                        callback(true, "Le comptage est fini", obj)
                                    }
                                })
                            })

                        } else {
                            callback(false, "Aucun utilisateur n'y est")
                        }
                    }
                })
            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        callback(false, "Une erreur est survenue lors du comptage par type d'utilisateur : " + exception)
    }
}