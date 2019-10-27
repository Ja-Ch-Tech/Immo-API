var db = require("..mode_immobilier/db");

var collection = {
    value: null
}

//Pour initialisation
module.exports.initialize = (db) => {

    collection.value = db.get().collection("extra");
}

module.exports.getNotification = (id_admin, limit,  callback) => {
    try {
        var admin = require("./admin");

        admin.initialize(db);
        admin.findOneById(id_admin, (isFound, message, resultFound) => {
            if (isFound) {
                var customLimit = limit ? limit : {
                    "$match": {}
                };

                collection.value.aggregate([
                    {
                        "$match": {
                            "id_owner": null,
                            "read": false,
                            "typeNotif": new RegExp("owner publish", "i"),
                            "type": new RegExp("notification", "i")
                        }
                    },
                    {
                        "$project": {
                            "_id": 1,
                            "id_owner": 0,
                            "id_user": 1,
                            "id_immo": 1,
                            "created_at": 1,
                            "count": {"$sum": 1}
                        }
                    },
                    {
                        "$sort": {
                            "created_at": -1
                        }
                    },
                    customLimit
                ]).toArray((err, resultAggr) => {
                    if (err) {
                        callback(false, "Une erreur est survenue lors de la récupération des notification de la publication des immo : " +err)
                    } else {
                        if (resultAggr.length > 0) {
                            var immo = require("../immobilier");

                            immo.initialize(db);
                        } else {
                            callback(false, "Aucune notification sur la publication")
                        }
                    }
                })
            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des notification de la publication des immo : " + exception)        
    }
}