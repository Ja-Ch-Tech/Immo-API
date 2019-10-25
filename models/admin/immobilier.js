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

module.exports.toggleTagValid = (id_admin, id_immo, callback) => {
    try {
        var admin = require("./admin");

        admin.initialize(db);
        admin.findOneById(id_admin, (isFound, message, resultFound) => {
            if (isFound) {
                var immo = require("../immobilier");

                immo.initialize(db);
                immo.getDetailsForImmovable(id_immo, (isGet, message, resultImmo) => {
                    if (isGet) {
                        var updateVar = resultImmo.validate ? false : true;

                        immo.toggleThis(id_immo, updateVar, (isToggle, message, resultToggle) => {
                            
                            callback(isToggle, message, resultToggle)
                        })
                    } else {
                        callback(false, message)
                    }
                })
            } else {
                callback(false, message)
            }
        })
    } catch (exception) {

    }
}