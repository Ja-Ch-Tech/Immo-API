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
                                                    callback(true, "La publication a marché", result.ops[0])
                                                } else {
                                                    callback(false, "La publication n'a pas abouti")
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
            sortie = 0,
            listSortie = [];

        props.images.map(image => {
            let update = {
                "$push": {
                    "images": image
                }
            };

            updateThis(filter, update, (isUp, message, result) => {
                sortie++;
                listSortie.push({
                    image: image,
                    state: isUp,
                    message: message
                })

                if (sortie == props.images) {
                    callback(true, "Les definitions sont finis en voici les détails", listSortie)
                }
            });
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise à jour de l'image de cet utilisateur : " + exception)
    }
}

//Mise à jour du tables des images
function updateThis(filter, update, callback) {
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
}

/**
|--------------------------------------------------
| Pas encore fait
|--------------------------------------------------
*/

//A continuer
module.exports.getImmobilierByMode = (id_user, callback) => {
    try {
        
    } catch (exception) {
        
    }
}

//A continuer
module.exports.getNewImmobilier = (limit, callback) => {
    try {

    } catch (exception) {

    }
}

//A continuer
module.exports.getTopImmobilier = (limit, callback) => {
    try {

    } catch (exception) {

    }
}

//A continuer
module.exports.searchImmobilier = (text, callback) => {
    try {
        
    } catch (exception) {
        
    }
}