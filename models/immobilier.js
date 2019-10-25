var db = require("./db");

var collection = {
    value: null
}

//Pour initialisation
module.exports.initialize = (db) => {

    collection.value = db.get().collection("immobilier");
}

//Publication des immobilier
module.exports.publish = (newImmo, newAdresse, callback) => {
    try {
        var users = require("./users");

        users.initialize(db);
        users.testAccount(newImmo, (isOwner, message) => {
            if (isOwner) {
                var mode = require("./mode_immobilier");

                mode.initialize(db);
                mode.findOne(newImmo.id_mode_immo, (isFound, message, resultMode) => {
                    if (isFound) {
                        var typeImmo = require("./type_immobilier");

                        typeImmo.initialize(db);
                        typeImmo.findOne(newImmo.id_type_immo, (isFound, message, resultType) => {
                            if (isFound) {
                                var adresse = require("./adresse");

                                adresse.initialize(db);
                                adresse.create(newAdresse, (isCreated, message, resultAdresse) => {
                                    if (isCreated) {
                                        newImmo.id_adresse = "" + resultAdresse._id;

                                        collection.value.insertOne(newImmo, (err, result) => {
                                            if (err) {
                                                callback(false, "Une erreur est survenue lors de la publication de la " + resultType.intitule + " : " + err)
                                            } else {
                                                if (result) {
                                                    var entity = require("./entities/extra").Notification(),
                                                        model = require("./extra");

                                                    entity.id_owner = null;
                                                    entity.id_user = result.ops[0].id_user;
                                                    entity.id_immo = result.ops[0]._id;
                                                    entity.typeNotif = "Owner publish";

                                                    model.initialize(db);
                                                    model.createNotification(entity, (isCreated, message, resultNotif) => {
                                                        callback(true, "La publication a marché", result.ops[0])
                                                    })
                                                } else {
                                                    callback(false, "La publication n'a pas abouti");
                                                }
                                            }
                                        })
                                    } else {
                                        callback(false, message)
                                    }
                                })

                            } else {
                                callback(false, message)
                            }
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
        callback(false, "Une exception a été lévée survenue lors de la publication de l'immobilier : " + exception)
    }
}

/**
 * Module permettant de définir l'image du produit
 * @param {Object} props L'ensemble des propriété
 * @param {Function} callback La fonction de retour
 */
module.exports.setImage = (props, callback) => {
    try {
        var filter = {
                "_id": require("mongodb").ObjectId(props.id_immo)
            },
            update = {
                "$set": {
                    "images": props.images
                }
            };

        collection.value.updateOne(filter, update, (err, resultUpdate) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la mise à jour de l'image de cet utilisateur : " + err);
            }
            else {
                if (resultUpdate) {
                    callback(true, "Mise à jour a été faite", resultUpdate);
                }
                else {
                    callback(false, "La mise à jour n'a pas abouti");
                }
            }
        });

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise à jour de l'image de cet utilisateur : " + exception)
    }
}

module.exports.getDetailsForType = (callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "flag": true,
                    "validate": true
                }
            },
            {
                "$group": {
                    _id: {
                        "id_type_immo": "$id_type_immo"
                    },
                    "count": { "$sum": 1 }
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur lors de la récupération de détails : " + err)
            } else {
                if (resultAggr.length > 0) {
                    var type_immobilier = require("./type_immobilier"),
                        sortie = 0,
                        listRetour = [];

                    type_immobilier.initialize(db);
                    for (let index = 0; index < resultAggr.length; index++) {
                        type_immobilier.findOne(resultAggr[index]._id.id_type_immo, (isFound, message, result) => {
                            sortie++;
                            if (isFound) {
                                listRetour.push({
                                    "_id": "" + result._id,
                                    "intitule": result.intitule,
                                    "nbreProp": resultAggr[index].count
                                })
                            }

                            if (sortie == resultAggr.length) {
                                callback(true, "La liste des types est leurs stats", listRetour)
                            }
                        })
                    }
                } else {
                    callback(false, "Aucun type n'y est fait reference")
                }
            }
        })
    } catch (exception) {

    }
}

module.exports.getNewImmobilier = (limit, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "flag": true,
                    "validate": true
                }
            },
            {
                "$sort": {
                    "created_at": -1
                }
            },
            {
                "$limit": limit ? limit : 4
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur de récupération de nouvelle publication : " + err)
            } else {
                if (resultAggr.length > 0) {
                    var users = require("./users"),
                        sortie = 0,
                        listRetour = [];

                    users.initialize(db);
                    for (let index = 0; index < resultAggr.length; index++) {
                        users.getInfoForThisUserAndThisPublish(resultAggr[index], (isGet, message, resultUsers) => {
                            sortie++;
                            if (isGet) {
                                listRetour.push(resultUsers);
                            }

                            if (sortie == resultAggr.length) {
                                callback(true, "Les news sont là", listRetour)
                            }
                        })
                    }

                } else {
                    callback(false, "Aucune nouvelle publication")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception lors de la récupération de nouvelle publication : " + exception)
    }
}

//Module de récupération des immobiliers classé par mode d'ajouts
module.exports.getAllImmovableForOwner = (objet, callback) => {
    try {
        var user = require("./users");

        user.initialize(db);
        user.testAccount(objet, (isOwner, message, resultOwner) => {
            if (isOwner) {

                collection.value.aggregate([
                    {
                        "$match": {
                            "id_user": objet.id_user
                        }
                    },
                    {
                        "$group": {
                            "_id": "$id_mode_immo",
                            "data": {
                                "$push": {
                                    "surface": "$surface",
                                    "nbrePiece": "$nbrePiece",
                                    "nbreChambre": "$nbreChambre",
                                    "nbreDouche": "$nbreDouche",
                                    "prix": "$prix",
                                    "flag": "$flag",
                                    "validate": "$validate",
                                    "images": "$images",
                                    "id_adresse": "$id_adresse",
                                    "description": "$description",
                                    "created_at": "$created_at"
                                }
                            }
                        }
                    }
                ]).toArray((err, resultAggr) => {
                    if (err) {
                        callback(false, "Une erreur est survenue lors de la récupération des biens par mode du propriétaire : " + err)
                    } else {
                        if (resultAggr.length > 0) {
                            var mode = require("./mode_immobilier"),
                                adresse = require("./adresse"),
                                sortieMode = 0,
                                lastOut = [];

                            mode.initialize(db);
                            adresse.initialize(db);

                            for (let index = 0; index < resultAggr.length; index++) {
                                mode.findWithObject(resultAggr[index], (isFound, message, resultMode) => {

                                    if (isFound) {

                                        var objetOut = {
                                            "mode": resultMode.intitule,
                                            "immobiliers": []
                                        }

                                        var sortieImmo = 0,
                                            listImmo = [];

                                        for (let c = 0; c < resultAggr[index].data.length; c++) {
                                            adresse.findWithObjet(resultAggr[index].data[c], (isFound, message, resultAdresse) => {

                                                if (isFound) {
                                                    listImmo.push({
                                                        "surface": resultAdresse.surface,
                                                        "nbrePiece": resultAdresse.nbrePiece,
                                                        "nbreChambre": resultAdresse.nbreChambre,
                                                        "nbreDouche": resultAdresse.nbreDouche,
                                                        "prix": resultAdresse.prix,
                                                        "adresse": resultAdresse.adresse,
                                                        "description": resultAdresse.description,
                                                        "created_at": resultAdresse.created_at
                                                    })
                                                }

                                                sortieImmo++;

                                                if (sortieImmo == resultAggr[index].data.length) {
                                                    objetOut.immobiliers.push(listImmo);
                                                    lastOut.push(objetOut);
                                                    sortieMode++
                                                    if (sortieMode == resultAggr.length) {
                                                        callback(true, "Les immobliers sont renvoyé en étant classé par mode d'ajout", lastOut)
                                                    }
                                                }
                                            })
                                        }
                                    }
                                })
                            }
                        } else {
                            callback(false, "Aucun produit pour ce propriétaire")
                        }
                    }
                })

            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des biens par mode du propriétaire : " + exception)
    }
}

//Module de récupération des details d'un immobilier
module.exports.getDetailsForImmovable = (id, callback) => {
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
                callback(false, "Une erreur lors de la récupération de détails d'un immobilier : " + err)
            } else {
                if (resultAggr.length > 0) {
                    var user = require("./users");

                    user.initialize(db);
                    user.getInfoForThisUserAndThisPublish(resultAggr[0], (isGet, message, resultUser) => {
                        if (isGet) {
                            callback(true, message, resultUser)
                        } else {
                            callback(false, message)
                        }
                    })
                } else {
                    callback(false, "Cet immobilier n'existe pas ou plus")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception est lévée lors de la récupération de détails d'un immobilier : " + exception)
    }

}

module.exports.getImmobilierByMode = (mode, callback) => {
    try {

        collection.value.aggregate([
            {
                "$match": {
                    "id_mode_immo": mode.id,
                    "flag": true,
                    "validate": true
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la récupération des biens par mode du propriétaire : " + err)
            } else {
                if (resultAggr.length > 0) {
                    var user = require("./users"),
                        sortieMode = 0,
                        lastOut = [];

                    user.initialize(db);

                    for (let index = 0; index < resultAggr.length; index++) {
                        user.getInfoForThisUserAndThisPublish(resultAggr[index], (isFound, message, resultMode) => {
                            sortieMode++
                            if (isFound) {
                                lastOut.push(resultMode)
                            }


                            if (sortieMode == resultAggr.length) {
                                callback(true, "Les immobliers sont renvoyé en étant classé par mode d'ajout", lastOut)
                            }
                        })
                    }
                } else {
                    callback(false, "Aucun produit pour ce propriétaire")
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des biens par mode du propriétaire : " + exception)
    }
}

module.exports.getImmovableForType = (id, callback) => {
    try {

        var typeImmo = require("./type_immobilier");

        typeImmo.initialize(db);
        typeImmo.findOne(id, (isFound, message, resultType) => {
            if (isFound) {
                var info = {
                    "categorie": resultType.intitule,
                    "immobiliers": []
                };

                collection.value.aggregate([
                    {
                        "$match": {
                            "id_type_immo": id,
                            "flag": true,
                            "validate": true
                        }
                    }
                ]).toArray((err, resultAggr) => {
                    if (err) {
                        callback(false, "Une erreur est survenue lors de la récupération des biens par mode du propriétaire : " + err)
                    } else {
                        if (resultAggr.length > 0) {
                            var user = require("./users"),
                                sortieMode = 0;


                            user.initialize(db);

                            for (let index = 0; index < resultAggr.length; index++) {
                                user.getInfoForThisUserAndThisPublish(resultAggr[index], (isFound, message, resultType) => {
                                    sortieMode++
                                    if (isFound) {
                                        delete resultType.type;
                                        info.immobiliers.push(resultType)
                                    }


                                    if (sortieMode == resultAggr.length) {
                                        callback(true, "Les immobliers sont renvoyé en étant classé pour un type", info)
                                    }
                                })
                            }
                        } else {
                            callback(false, "Aucun produit pour ce type")
                        }
                    }
                })
            } else {
                callback(false, message)
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des biens par mode du propriétaire : " + exception)
    }
}

module.exports.countImmovableForType = (objet, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "id_type_immo": "" + objet._id,
                    "flag": true,
                    "validate": true
                }
            },
            {
                "$count": "nbre"
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur lors du comptage : " + err)
            } else {
                objet.nbre = resultAggr.length > 0 ? resultAggr[0].nbre : 0
                callback(true, "Le comptage est fini", objet)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors du comptage : " + exception)
    }
}

//A suivre
module.exports.smartFind = (mode, type, commune, piece, maxAmount, minAmount, bathroom, callback) => {
    try {

        var filterForBath = bathroom ? {
                "$match": {
                    "nbreChambre": bathroom
                }
            } : {
                "$match": {}
            },
            filterForPiece = piece ? {
                "$match": {
                    "nbrePiece": piece
                }
            } : {
                "$match": {}
            },
            filterForMode = mode ? {
                "$match": {
                    "id_mode_immo": mode
                }
            } : {
                "$match": {}
            },
            filterForType = type ? {
                "$match": {
                    "id_type_immo": type
                }
            } : {
                "$match": {}
            }
        ;

        collection.value.aggregate([
            {
                "$match": {
                    "prix": {"$gte": minAmount},
                    "prix": {"$lte": maxAmount},
                    "flag": true,
                    "validate": true
                }
            },
            filterForBath,
            filterForPiece,
            filterForMode,
            filterForType
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de cette recherche : " + err)
            } else {
                if (resultAggr.length > 0) {
                    var user = require("./users"),
                        sortieMode = 0,
                        info = {
                            "immobiliers": []
                        };


                    user.initialize(db);

                    for (let index = 0; index < resultAggr.length; index++) {
                        user.getInfoForThisUserAndThisPublish(resultAggr[index], (isFound, message, resultType) => {
                            sortieMode++
                            if (isFound) {
                                
                                if (commune) {
                                    if (commune.toUpperCase() === resultType.adresse.commune.toUpperCase()) {
                                        delete resultType.type;
                                        info.immobiliers.push(resultType)
                                    }
                                }
                                
                            }


                            if (sortieMode == resultAggr.length) {
                                callback(true, "Les immobliers sont renvoyé pour cette recherche", info)
                            }
                        })
                    }
                } else {
                    callback(false, "Aucun truc")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une erreur est survenue lors de cette recherche : " + err)
    }
}

module.exports.toggleThis = (id_immo, updateVar, callback) => {
    try {
        var filter = {
                "_id": require("mongodb").ObjectId(id_immo)
            },
            update = {
                "$set": {
                    "validate": updateVar
                }
            }
        ;

        collection.value.updateOne(filter, update, (err, result) => {
            if (err) {
                callback(false, "Une erreur lors de la mise à jour de champs de validation : " +err)
            } else {
                if (result) {
                    callback(true, "La validation a abouti", result)
                } else {
                    callback(false, "Le champ n'a pas été mise à jour")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée de la mise à jour de champs de validation : " + exception)        
    }
}