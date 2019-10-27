var db = require("../db");

var collection = {
    value: null
}

//Pour initialisation
module.exports.initialize = (db) => {

    collection.value = db.get().collection("immobilier");
}

/**
 * Récupération de tous les immobiliers
 */
module.exports.getAllNotValidate = (id_admin, callback) => {
    try {
        var admin = require("./admin");

        admin.initialize(db);
        admin.findOneById(id_admin, (isFound, message, resultFound) => {
            if (isFound) {
                collection.value.aggregate([
                    {
                        "$match": {
                            "validate": false
                        }
                    },
                    {
                        "$sort": {
                            "created_at": -1
                        }
                    }
                ]).toArray((err, resultAggr) => {
                    if (err) {
                        callback(false, "Une erreur lors de la récupération des immobiliers non-validé : " + err)
                    } else {
                        if (resultAggr.length > 0) {
                            var user = require("../users"),
                                sortieMode = 0,
                                info = {
                                    "immobiliers": []
                                };


                            user.initialize(db);

                            for (let index = 0; index < resultAggr.length; index++) {
                                user.getInfoForThisUserAndThisPublish(resultAggr[index], (isFound, message, resultType) => {
                                    sortieMode++
                                    if (isFound) {
                                        info.immobiliers.push(resultType)
                                    }


                                    if (sortieMode == resultAggr.length) {
                                        callback(true, "Les immobliers non-validés sont renvoyé", info)
                                    }
                                })
                            }
                        } else {
                            callback(false, "Aucun immobilier est non-validé")
                        }
                    }
                })
            } else {
                callback(false, "Vous n'êtes pas administrateur")
            }
        })

    } catch (exception) {
        callback(false, "Une erreur lors de la récupération des immobiliers non-validé : " + err)        
    }
}