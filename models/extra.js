var db = require("./db")

var collection = {
    value: null
}

//Initialisation de la collection
module.exports.initialize = (db) => {

    collection.value = db.get().collection("extra");
}

/* Module permettant la définition dans les intêrets du client */
module.exports.SetInterest = (obj, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "id_user": obj.id_user,
                    "id_owner": obj.id_owner,
                    "id_immo": obj.id_immo,
                    "type": "Interest"
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de l'ajout dans l'archive : " + err)
            } else {
                if (resultAggr.length === 0) {

                    collection.value.insertOne(obj, (err, result) => {
                        if (err) {
                            callback(false, "Une erreur est survenue lors de l'insert dans l'achive : " + err)
                        } else {
                            if (result) {
                                delete result.ops[0].type;
                                var entity = require("./entities/extra").Notification();

                                entity.id_owner = result.ops[0].id_owner;
                                entity.id_user = result.ops[0].id_user;
                                entity.id_immo = result.ops[0].id_immo;
                                entity.typeNotif = "User Interest";

                                collection.value.insertOne(entity, (err, resultSecondInsert) => {
                                    if (err) {
                                        callback(false, "Erreur d'insertion de l'extra User Interest : " + err)
                                    } else {
                                        if (resultSecondInsert) {
                                            var immo = require("./immobilier"),
                                                objet = {
                                                    "id_immo": resultSecondInsert.ops[0].id_immo
                                                };

                                            immo.initialize(db);
                                            immo.testIfInLocation(objet, (isOkay, message, resultTest) => {
                                                if (isOkay) {
                                                    var user = require("./users"),
                                                        model = {
                                                            "id_user": resultSecondInsert.ops[0].id_owner,
                                                            "isInLocation": true
                                                        };

                                                    user.initialize(db);
                                                    user.getInfoOwner(model, (isGet, message, resultOwner) => {
                                                        callback(isGet, message, resultOwner)
                                                    })
                                                } else {

                                                    var entityForNotLocate = require("./entities/extra").Notification();

                                                    entityForNotLocate.id_owner = obj.id_owner;
                                                    entityForNotLocate.id_user = obj.id_user;
                                                    entityForNotLocate.id_immo = obj.id_immo;
                                                    entityForNotLocate.typeNotif = "User Interest This Sale";

                                                    module.exports.createNotification(entityForNotLocate, (isCreated, message, resultWhereNotLocate) => {
                                                        callback(true, "Veuiilez contacter l'admin", { isInLocation: false });
                                                    })
                                                }
                                            })
                                        } else {
                                            callback(false, "Aucune insertion à la deuxième étape")
                                        }
                                    }

                                })
                            } else {
                                callback(false, "L'insertion n'a pas été faites")
                            }
                        }
                    })
                } else {

                    var immo = require("./immobilier"),
                        objet = {
                            "id_immo": obj.id_immo
                        };

                    immo.initialize(db);
                    immo.testIfInLocation(objet, (isOkay, message, resultTest) => {
                        if (isOkay) {
                            var user = require("./users"),
                                model = {
                                    "id_user": obj.id_owner,
                                    "isInLocation": true
                                };

                            user.initialize(db);
                            user.getInfoOwner(model, (isGet, message, resultOwner) => {
                                callback(isGet, message, resultOwner)
                            })
                        } else {

                            var entity = require("./entities/extra").Notification();

                            entity.id_owner = obj.id_owner;
                            entity.id_user = obj.id_user;
                            entity.id_immo = obj.id_immo;
                            entity.typeNotif = "User Interest This Sale";

                            module.exports.createNotification(entity, (isCreated, message, result) => {
                                callback(true, "Veuiilez contacter l'admin", { isInLocation: false });
                            })
                        }
                    })
                }
            }
        })
    } catch (exception) {
        callback(false, "Une excetpion a été lévée lors de l'ajout dans l'archive : " + exception)
    }
}

/* Module permettant l'envoi de la notification au propriétaire de l'immobilier */
module.exports.createNotification = (newNotif, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "id_user": newNotif.id_user,
                    "id_owner": newNotif.id_owner,
                    "id_immo": newNotif.id_immo,
                    "typeNotif": { "$exists": 1 },
                    "$or": [
                        { "typeNotif": new RegExp("owner publish", "i") },
                        { "typeNotif": new RegExp("User Interest This Sale", "i") }
                    ],
                    "type": new RegExp("notification", "i")
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur lors de la creation du notification : " + err)
            } else {
                if (resultAggr.length === 0) {
                    collection.value.insertOne(newNotif, (err, result) => {
                        if (err) {
                            callback(false, "Erreur d'insertion de la notification : " + err)
                        } else {
                            if (result) {
                                var immo = require("./immobilier"),
                                    objet = {
                                        "id_immo": result.ops[0].id_immo
                                    };

                                immo.initialize(db);
                                immo.testIfInLocation(objet, (isOkay, message, resultTest) => {
                                    if (isOkay) {
                                        var user = require("./users"),
                                            model = {
                                                "id_user": result.ops[0].id_owner,
                                                "isInLocation": true
                                            };

                                        user.initialize(db);
                                        user.getInfoOwner(model, (isGet, message, resultOwner) => {
                                            callback(isGet, message, resultOwner)
                                        })
                                    } else {
                                        callback(true, "Veuiilez contacter l'admin", { isInLocation: false })
                                    }
                                })

                            } else {
                                callback(false, "Aucune insertion")
                            }
                        }
                    })
                } else {
                    var user = require("./users"),
                        model = {
                            "id_user": resultAggr[0].id_owner,
                            "isInLocation": false
                        };

                    user.initialize(db);
                    user.getInfoOwner(model, (isGet, message, resultOwner) => {
                        callback(isGet, message, resultOwner)
                    })
                }
            }
        })

    } catch (exception) {
        callback(false, "Exception lors d'insertion de la notification : " + exception)
    }
}

//Module permettant le comptage des personnes s'étant intérréssé à un immobilier
module.exports.count = (objet, callback) => {
    try {

        collection.value.aggregate([
            {
                "$match": {
                    "id_immo": "" + objet._id,
                    "type": "Interest"
                }
            },
            {
                "$count": "nbre"
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors du comptage des interêts : " + err)
            } else {

                if (resultAggr.length > 0) {
                    objet.nbreInterrest = resultAggr[0].nbre;

                    callback(true, "Les gens qui vont vous contacter", objet)
                } else {
                    objet.nbreInterrest = 0;

                    callback(false, "Les gens qui vont vous contacter", objet)
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors du comptage lors du comptage des interêts : " + exception)
    }
}

//Liste d'utilisateur s'étant intéressé par cette immobilier si et seulement si cette immobilier est en location
module.exports.listUserInterestToImmo = (objet, id_admin, callback) => {
    try {
        if (id_admin && id_admin != "null") {
            collection.value.aggregate([
                    {
                        "$match": {
                            "id_immo": objet.id_immo,
                            "type": new RegExp("Interest", "i")
                        }
                    }
                ]).toArray((err, resultAggr) => {
                    if (err) {
                        callback(false, "Erreur lors de la récupération des users : " + err)
                    } else {
                        if (resultAggr.length > 0) {
                            var users = require("./users"),
                                sortieUsers = 0,
                                listRetour = [];

                            users.initialize(db);

                            for (let index = 0; index < resultAggr.length; index++) {
                                users.getInfoForAnyUser(resultAggr[index].id_user, (isGet, message, resultInfo) => {
                                    sortieUsers++;
                                    if (isGet) {
                                        listRetour.push(resultInfo);
                                    }

                                    if (sortieUsers == resultAggr.length) {
                                        callback(true, "Les infos des utilsateur ayant un intérêt a votre immobilier", listRetour)
                                    }
                                })
                            }
                        } else {
                            callback(false, "Aucun user n'est intérressé")
                        }
                    }
                })
        } else {
            var immo = require("./immobilier");

            immo.initialize(db);
            immo.testIfInLocation(objet, (isOkay, message, resultTest) => {
                if (isOkay) {
                    collection.value.aggregate([
                        {
                            "$match": {
                                "id_immo": objet.id_immo,
                                "type": new RegExp("Interest", "i")
                            }
                        }
                    ]).toArray((err, resultAggr) => {
                        if (err) {
                            callback(false, "Erreur lors de la récupération des users : " + err)
                        } else {
                            if (resultAggr.length > 0) {
                                var users = require("./users"),
                                    sortieUsers = 0,
                                    listRetour = [];

                                users.initialize(db);

                                for (let index = 0; index < resultAggr.length; index++) {
                                    users.getInfoForAnyUser(resultAggr[index].id_user, (isGet, message, resultInfo) => {
                                        sortieUsers++;
                                        if (isGet) {
                                            listRetour.push(resultInfo);
                                        }

                                        if (sortieUsers == resultAggr.length) {
                                            callback(true, "Les infos des utilsateur ayant un intérêt a votre immobilier", listRetour)
                                        }
                                    })
                                }
                            } else {
                                callback(false, "Aucun user n'est intérressé")
                            }
                        }
                    })
                } else {
                    callback(false, "Veuillez contacter l'administrattion pour voir ces gens")
                }
            }) 
        }
        
    } catch (exception) {
        callback(false, "Erreur lors de la récupération des users : " + err)
    }
}

//Liste des immobiliers ajouter aux préférences de l'utilisateur
module.exports.listImmoAddToExtraForUserAccordingType = (id_user, type, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "id_user": id_user,
                    "mode": "Set",
                    "type": parseInt(type) == 0 ? "Interest" : (parseInt(type) == 1 ? "Favorite" : type)
                }
            },
            {
                "$sort": { "created_at": -1 }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur lors de la récupérations des immobiliers en favoris ou en intêret : " + err)
            } else {
                if (resultAggr.length > 0) {
                    var immo = require("./immobilier"),
                        sortie = 0,
                        listRetour = [];

                    immo.initialize(db);

                    for (let index = 0; index < resultAggr.length; index++) {
                        immo.getDetailsForImmovable(resultAggr[index].id_immo, (isGet, message, resultWithDetails) => {
                            
                            sortie++;

                            if (isGet) {
                                listRetour.push(resultWithDetails);
                            }

                            if (sortie === resultAggr.length) {
                                callback(true, "Les préference de type " + (parseInt(type) == 0 ? "Interrest" : (parseInt(type) == 1 ? "Favorite" : type)), listRetour)
                            }
                        })
                    }

                } else {
                    callback(false, "Aucun immobilier est dans ses " + (parseInt(type) == 0 ? "intêrets" : (parseInt(type) == 1 ? "favoris" : type)))
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exceptiona été lévée lors de la récupérations des immobiliers en favoris ou en intêret : " + exception)
    }
}

/* Module permettant la définition dans ses favoris */
module.exports.SetFavorite = (obj, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "id_user": obj.id_user,
                    "id_immo": obj.id_immo,
                    "type": "Favorite"
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de l'ajout dans l'archive : " + err)
            } else {
                if (resultAggr.length === 0) {
                    collection.value.insertOne(obj, (err, result) => {
                        if (err) {
                            callback(false, "Une erreur est survenue lors de l'insert dans l'achive : " + err)
                        } else {
                            if (result) {

                                callback(true, "L'ajout dans les favoris", result.ops[0])
                            } else {
                                callback(false, "L'insertion n'a pas été faites")
                            }
                        }
                    })
                } else {
                    var filter = {
                        "id_immo": obj.id_immo,
                        "id_user": obj.id_user,
                        "type": "Favorite"
                    };

                    collection.value.aggregate([
                        {
                            "$match": filter
                        }
                    ]).toArray((err, result) => {
                        if (err) {
                            callback(false, "Une erreur lors de la redéfinition du flag : " + err)
                        } else {
                            if (result.length > 0) {
                                var filterForThis = {
                                    "_id": result[0]._id
                                },
                                    update = {
                                        "flag": result[0].flag ? false : true
                                    };

                                collection.value.updateOne(filterForThis, update, (err, resultUp) => {
                                    if (err) {
                                        callback(false, "Une erreur dans la mise à jour du flag : " + err)
                                    } else {
                                        if (resultUp) {
                                            callback(true, "La mise à jour du flag a été effective", resultUp)
                                        } else {
                                            callback(false, "Aucune mise à jour n'a été éffectué")
                                        }
                                    }
                                })
                            } else {

                            }
                        }
                    })
                }
            }
        })
    } catch (exception) {
        callback(false, "Une excetpion a été lévée lors de l'ajout dans l'archive : " + exception)
    }
}

/**
 * Module permettant la determination des si oui ou non l'immo est parmi les favoris du client
 */
module.exports.isThisInFavorite = (objet, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "id_immo": "" + objet._id,
                    "id_user": objet.id_user
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "flag": 1
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la détérmination des favoris : " +err)
            } else {
                if (resultAggr.length > 0) {
                    objet.isThisInFavorite = resultAggr[0].flag;
                    callback(true, "La determination y est", objet)
                } else {
                    objet.isThisInFavorite = false;
                    callback(false, "Cet immo n'est pas dans ses favoris", objet)
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la détérmination des favoris : " + exception)
    }
}