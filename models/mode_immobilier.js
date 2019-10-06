var db = require("./db");

var collection = {
    value: null
}

//Pour initialisation
module.exports.initialize = (db) => {

    collection.value = db.get().collection("mode_immobilier");
}

//Ajout d'un mode d'immobilier
module.exports.create = (newMode, callback) => {
    try {
        collection.value.insertOne(newMode, (err, result) => {
            if (err) {
                callback(false, "Erreur : " +err)
            } else {
                callback(true, "Enregistrer", result.ops[0])
            }
        })
    } catch (exception) {
        callback(false, "Exception : " + exception)
    }
}

//Récupération de mode
module.exports.getAll = (callback) => {
    try {
        collection.value.aggregate([
            {
                "$project": {
                    "_id": 1,
                    "intitule": 1
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la récupération des modes : " + err)
            } else {
                if (resultAggr.length > 0) {
                    callback(true, "Les modes ont été renvoyé", resultAggr)
                } else {
                    callback(false, "Aucune mode existant")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée  lors de la récupération des modes : " + exception)
    }
}

module.exports.findOne = (id, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "_id": require("mongodb").ObjectId(id),
                    "flag": true
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur de recherche de mode : " + err)
            } else {
                if (resultAggr.length > 0) {
                    callback(true, "Le mode y est", resultAggr[0])
                } else {
                    callback(false, "Ce mode n'existe pas ou n'est pas autorisé")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception de recherche de mode : " + exception)
    }
}

module.exports.getInfoForThisUserAndThisPublish = (objet, callback) => {
    try {
        module.exports.findOne(objet.id_mode_immo, (isFound, message, resultMode) => {
            if (isFound) {
                objet.mode = resultMode.intitule;
                delete objet.id_mode_immo

                var type = require("./type_immobilier");

                type.initialize(db);
                type.getInfoForThisUserAndThisPublish(objet, (isGet, message, resultType) => {
                    if (isGet) {
                        callback(true, "Le type d'immobilier et les autres info y sont", resultType)
                    } else {
                        callback(false, message)
                    }
                })
            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        callback(false, "Une exception est lévée : " +exception)
    }
}

module.exports.findWithObject = (objet, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "_id": require("mongodb").ObjectId(objet._id),
                    "flag": true
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false ,"Une erreur est survenue lors de la récupération de détails du mode : " +err)
            } else {
                if (resultAggr.length > 0) {
                    objet.intitule = resultAggr[0].intitule;

                    callback(true, "Le mode y est", objet)
                } else {
                    callback(false, "Aucun mode n'y correspond")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération de détails du mode : " + exception)        
    }
}

module.exports.findWithObjectForAModeDefine = (objet, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "_id": require("mongodb").ObjectId(objet.id_mode_immo),
                    "flag": true
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la récupération de détails du mode : " + err)
            } else {
                if (resultAggr.length > 0) {
                    objet.intituleMode = resultAggr[0].intitule;
                    delete objet.id_mode_immo

                    var user = require("./users");

                    user.initialize(db);
                    user.getInfoForThisUserAndThisPublish(objet, (isGet, message, resultUser) => {
                        if (isGet) {
                            callback(true, "Les infos y sont", resultUser)
                        } else {
                            callback(false, message)
                        }
                    })
                } else {
                    callback(false, "Aucun mode n'y correspond")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération de détails du mode : " + exception)
    }
}