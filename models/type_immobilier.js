var db = require("./db");

var collection = {
    value: null
}

//Pour initialisation
module.exports.initialize = (db) => {

    collection.value = db.get().collection("type_immobilier");
}

//Ajout de type
module.exports.create = (newType, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "intitule": new RegExp(newType.intitule, "i"),
                    "flag": true
                }
            }
        ]).toArray((errTest, resultAggr) => {
            if (errTest) {
                callback(false, "Une erreur existe dans le test de reconnaissance du type : " +errTest)
            } else {
                if (resultAggr.length <= 0) {
                    collection.value.insertOne(newType, (err, result) => {
                        if (err) {
                            callback(false, "Une erreur est survenu lors de l'insertion du type : " +err)
                        } else {
                            if (result) {
                                callback(true, "Le type est inséré", result.ops[0])
                            } else {
                                callback(false, "L'insertion n'a pas abouti")
                            }
                        }
                    })
                } else {
                    callback(false, "Ce type existe déjà")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a étét lévée lors de l'insertion du type : " + exception)        
    }
}

//Récupération de type
module.exports.getAll = (callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "flag": true
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la récupération des types : " + err)
            } else {
                if (resultAggr.length > 0) {
                    var sortie = 0,
                        immobilier = require("./immobilier"),
                        listRetour = [];

                    immobilier.initialize(db);
                    for (let index = 0; index < resultAggr.length; index++) {
                        immobilier.countImmovableForType(resultAggr[index], (isCount, message, resultImmo) => {
                            sortie++;
                            if (isCount) {
                                listRetour.push(resultImmo);
                            }

                            if (sortie == resultAggr.length) {
                                callback(true, "Les types ont été renvoyé", listRetour)
                            }
                        })
                    }
                } else {
                    callback(false, "Aucun type existant")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée  lors de la récupération des types : " + exception)        
    }
}

//Désactivation d'un type d'immobilier
module.exports.disabledType = (id, callback) => {
    try {
        collection.value.updateOne(
            {
                "_id": require("mongodb").ObjectId(id)
            },
            {
                "$set": {
                    "flag": false
                }
            },(err, result) => {
                if (err) {
                    callback(false, "Une erreur est survenue lors de la désactivation de type : " +err)
                } else {
                    if (result) {
                        callback(true, "Type désactivé", result)
                    } else {
                        callback(false, "La désactivation a échoué")
                    }
                }
            })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la désactivation de type : " + exception)
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
        module.exports.findOne(objet.id_type_immo, (isFound, message, resultType) => {
            if (isFound) {
                objet.type = resultType.intitule;
                delete objet.id_type_immo;

                if (objet.images && objet.images.length > 0) {
                    var media = require("./media");

                    media.initialize(db);
                    media.getInfoForThisUserAndThisPublish(objet, (isGet, message, resultWithMedia) => {

                        callback(true, message, resultWithMedia)

                    })
                } else {
                    callback(true, "L'image n'existe pas, donc l'etape a été ignorer", objet)
                }
                
            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        callback(false, "Une exception est lévée : " + exception)
    }
}