var db = require("../db");

var collection = {
    value: null
}

//Pour initialisation
module.exports.initialize = (db) => {

    collection.value = db.get().collection("extra");
}

module.exports.getNotification = (id_admin, limit, callback) => {
    try {
        var admin = require("./admin");

        admin.initialize(db);
        admin.findOneById(id_admin, (isFound, message, resultFound) => {
            if (isFound) {
                var customLimit = limit ? {"$limit": parseInt(limit, 10)} : {
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
                            "id_user": 1,
                            "id_immo": 1,
                            "created_at": 1
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
                            var immo = require("../immobilier"),
                                sortieNotif = 0,
                                listRetour = [];

                            immo.initialize(db);
                            for (let index = 0; index < resultAggr.length; index++) {
                                immo.getDetailsForImmovable(resultAggr[index].id_immo, (isGet, message, resultDetails) => {
                                    sortieNotif++;
                                    if (isGet) {
                                        listRetour.push({
                                            infoNotif: resultAggr[index],
                                            details: resultDetails
                                        })
                                    }

                                    if (sortieNotif == resultAggr.length) {
                                        let obj = {
                                            notifications: listRetour
                                        };
                                        callback(true, "Les notifications ont été renvoyé", obj)
                                    }
                                })
                            }
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