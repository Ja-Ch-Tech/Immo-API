var db = require("./db")

var collection = {
    value: null
}

module.exports.initialize = (db) => {

    collection.value = db.get().collection("extra");
}

module.exports.SetInterest = (objet, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "id_user": objet.id_user,
                    "id_owner": objet.id_owner,
                    "id_immo": objet.id_immo,
                    "type": "Interest"
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de l'ajout dans l'archive : " +err)
            } else {
                if (resultAggr.length === 0) {
                    collection.value.insertOne(objet, (err, result) => {
                        if (err) {
                            callback(false, "Une erreur est survenue lors de l'insert dans l'achive : " +err)
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
                    var user = require("./users"),
                        model = {
                            "id_user": objet.id_owner
                        };

                    user.initialize(db);
                    user.getInfoOwner(model, (isGet, message, resultOwner) => {
                        callback(isGet, message, resultOwner)
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
                callback(false, "Erreur d'insertion de la notification : " +err)
            } else {
                if (result) {
                    var user = require("./users"),
                        model = {
                            "id_user": result.ops[0].id_owner
                        };

                    user.initialize(db);
                    user.getInfoOwner(model, (isGet, message, resultOwner) => {
                        callback(isGet, message, resultOwner)
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
                callback(false, "Une erreur est survenue lors du comptage des interêts : " +err)
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
                        callback(false, "Erreur lors de la récupération des users : " +err)
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
        callback(false, "Erreur lors de la récupération des users : " +err)
    }
}