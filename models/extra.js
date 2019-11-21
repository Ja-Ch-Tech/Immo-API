var db = require("./db")

var collection = {
    value: null
}

module.exports.initialize = (db) => {

    collection.value = db.get().collection("extra");
}

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

                                module.exports.createNotification(entity, (isCreated, message, result) => {
                                    if (isCreated) {
                                        callback(true, "L'ajout dans l'archive y est", result)
                                    } else {
                                        callback(true, "Vous êtes intérréssé, malheureusement la notification n'est pas arrivé")
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
                                    "id_user": obj.id_owner
                                };

                            user.initialize(db);
                            user.getInfoOwner(model, (isGet, message, resultOwner) => {
                                resultOwner.isInLocation = isOkay;
                                callback(isGet, message, resultOwner)
                            })
                        } else {

                            callback(true, "Veuiilez contacter l'admin", { isInLocation: false })
                        }
                    })
                }
            }
        })
    } catch (exception) {
        callback(false, "Une excetpion a été lévée lors de l'ajout dans l'archive : " + exception)
    }
}

module.exports.createNotification = (newNotif, callback) => {
    try {
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
                                    "id_user": result.ops[0].id_owner
                                };

                            user.initialize(db);
                            user.getInfoOwner(model, (isGet, message, resultOwner) => {
                                resultOwner.isInLocation = isOkay;
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
    } catch (exception) {
        callback(false, "Exception lors d'insertion de la notification : " + exception)
    }
}

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
module.exports.listUserInterestToImmo = (objet, callback) => {
    try {
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
    } catch (exception) {
        callback(false, "Erreur lors de la récupération des users : " + err)
    }
}

//Liste des immobiliers ajouter aux préférences de l'utilisateur
/*module.exports.listImmoAddToExtraForUser = (id_user, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "id_user": id_user,
                    "mode": "Set"
                }
            },
            {
                "$group": {
                    "_id": {
                        "mode": "$mode",
                        "type": "$type"
                    },
                    "immobiliers": {
                        "$push": {
                            "id_immo": "$id_immo",
                            "created_at": "$created_at"
                        }
                    }
                }
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
                        var obj = {
                            "type": resultAggr[index]._id.type,
                            "immo": []
                        },
                        sortieImmo = 0;

                        sortie++;

                        for (let a = 0; a < resultAggr[index].immobiliers.length; a++) {
                            immo.getDetailsForImmovable(resultAggr[index].immobiliers[a].id_immo, (isGet, message, resultWithDetails) => {
                                sortieImmo++;
                                

                                obj.immo.push(resultWithDetails);
                                console.log(obj);
                                

                                if (sortieImmo == resultAggr[index].immobiliers.length) {
                                    listRetour.push(obj);

                                    if (sortie === resultAggr.length) {
                                        callback(true, "okay", listRetour)
                                    }
                                }

                                
                            })
                        }
                        
                                
                    }
                } else {
                    callback(false, "Aucun immobilier est dans ses intérêts ou dans ses favoris")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exceptiona été lévée lors de la récupérations des immobiliers en favoris ou en intêret : " + exception)
    }
}*/

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
                            callback(false, "Une erreur lors de la redéfinition du flag : " +err)
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