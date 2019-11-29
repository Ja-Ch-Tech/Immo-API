//Appelle à la base de données
var db = require("./db");

var collection = {
    value: null
}

module.exports.initialize = function (db_js) {

    collection.value = db_js.get().collection("logs");
}

//Module pour la sauvegarde des recherches non-trouvés
module.exports.saveSearch = (searchNotFound, callback) => {
    try {
        searchNotFound.id_user = searchNotFound.id_user ? searchNotFound.id_user : null;
        collection.value.insertOne(searchNotFound, (err, result) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la sauvegarde de la recherche : " + err)
            } else {
                if (result) {
                    callback(true, "La sauvegarde a réussi, nous prevenons tous les bailleurs pour qu'ils puissent ajouté cela", result.ops[0])
                } else {
                    callback(false, "La recherche n'a pas pu aboutir")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la sauvegarde de la recherche : " + exception)
    }
}

/**
 * Module de la sauvegarde de la connexion d'un user
 */
module.exports.saveLogin = (id_user, callback) => {
    try{
        collection.value.aggregate([
            {
                "$match": {
                    "id_user": id_user,
                    "type": "Login"
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur lors de la recherche de l'historique de connexion : " + err)
            } else {
                if (resultAggr.length > 0) {
                    var filter = {
                        "id_user": id_user,
                        "type": "Login"
                    },
                    objetAdd = {
                        "connect_at": new Date()
                    },
                    update = {
                        "$push": {
                            "history": objetAdd
                        }
                    };

                    collection.value.updateOne(filter, update, (err, resultUp) => {
                        if (err) {
                            callback(false, "La mise à jour de l'historique n'a pas abouti : " +err)
                        } else {
                            if (resultUp) {
                                callback(true, "L'historique a été mise à jour", resultUp)
                            } else {
                                callback(false, "Aucune mise à jour de l'historique n'a été vu")
                            }
                        }
                    })
                } else {
                    var entity = require("./entities/log").Login();

                    entity.id_user = id_user;
                    entity.history.push({ "connect_at": new Date() });

                    collection.value.insertOne(entity, (err, result) => {
                        if (err) {
                            callback(false, "Une erreur lors de la sauvegarde de la connexion : " + err)
                        } else {
                            if (result) {
                                callback(true, "La sauvegarde a abouti", result.ops[0])
                            } else {
                                callback(false, "la sauvegarde n'a pas abouti")
                            }
                        }
                    })
                }
            }
        })
    }catch(exception){
        callback(false, "Une exception a été lévée lors de la sauvegarde de la connexion : " + exception)
    }
}