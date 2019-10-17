
var db = require("./db");

var collection = {
    value: null
}

module.exports.initialize = (db) => {

    collection.value = db.get().collection("adresse");
}

//Ajout d'une adresse
module.exports.create = (newAdresse, callback) => {
    try {
        collection.value.insertOne(newAdresse, (err, result) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de l'insertion de l'adresse : " +err)
            } else {
                if (result) {
                    callback(true, "L'adresse est inséré", result.ops[0])
                } else {
                    callback(false, "L'insertion n'a pas abouti")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de l'insertion de l'adresse : " + exception)        
    }
}

function findOneById(id, callback) {
    collection.value.aggregate([
        {
            "$match": {
                "_id": require("mongodb").ObjectId(id)
            }
        }
    ]).toArray((err, resultAggr) => {
        if (err) {
            callback(false, "Une erreur dans la fonction de recupération d'une adresse : " + err)
        } else {
            if (resultAggr.length > 0) {
                callback(true, "elle a été trouvée", resultAggr[0])
            } else {
                callback(false, "Aucune adresse n'occupe cet identifiant")
            }
        }
    })
}

module.exports.getInfoForThisUserAndThisPublish = (objet, callback) => {
    try {
        findOneById(objet.id_adresse, (isFound, message, resultAdresse) => {
            if (isFound) {
                objet.adresse = resultAdresse;
                delete objet.id_adresse;
                var mode = require("./mode_immobilier");

                mode.initialize(db);
                mode.getInfoForThisUserAndThisPublish(objet, (isGet, message, resultMode) => {
                    if (isGet) {
                        callback(true, "Le mode d'allocation et les autres info y sont", resultMode)
                    } else {
                        callback(false, message)
                    }
                })            
            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée : " +exception)
    }
}

module.exports.findWithObjet = (objet, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "_id": require("mongodb").ObjectId(objet.id_adresse)
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur lors de la récupération de l'adresse : " +err)
            } else {
                if (resultAggr.length > 0) {
                    objet.adresse = {
                        "commune": resultAggr[0].commune,
                        "avenue": resultAggr[0].avenue,
                        "numero": resultAggr[0].numero,
                        "reference": resultAggr[0].reference,
                        "quartier": resultAggr[0].quartier ? resultAggr[0].quartier : null
                    };

                    delete objet.id_adresse;

                    var media = require("./media");

                    media.initialize(db);
                    media.findImageForUser(objet, (isFound, message, resultWithMedia) => {
                        callback(true, "L'adresse est là", objet)                        
                    })
                } else {
                    objet.adresse = {};

                    delete objet.id_adresse;
                    var media = require("./media");

                    media.initialize(db);
                    media.findImageForUser(objet, (isFound, message, resultWithMedia) => {
                        callback(false, "Aucune adresse n'a été répertorié à ce niveau", resultWithMedia)
                    })
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception lors de la récupération de l'adresse : " + exception)        
    }
}