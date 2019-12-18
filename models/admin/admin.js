var db = require("../db")
bcrypt = require("bcryptjs");

var collection = {
    value: null
}

module.exports.initialize = (db) => {

    collection.value = db.get().collection("admin");
}

/**
 * Le module qui permet à un administrateur de créer son compte
 */
module.exports.create = (newAdmin, callback) => {
    try {

        //On commence par crypter le mot de passe        
        var valeur_pwd = "AdminJa" + newAdmin.password + "chAdmin";

        bcrypt.hash(valeur_pwd, 10, function (errHash, hashePwd) {

            if (errHash) { //Si une erreure survient lors du hashage du mot de passe
                callback(false, "Une erreur est survenue lors du hashage du mot de passe : " + errHash);
            } else { //Si non le mot de passe a été bien hashé

                newAdmin.password = hashePwd;
                
                if (newAdmin.create_by) {
                    module.exports.findOneById(newAdmin.create_by, (isFound, message, resultFound) => {
                        if (isFound) {
                            create(newAdmin, (isCreate, message, result) => {
                                if (isCreate) {
                                    callback(true, message, result)
                                } else {
                                    callback(false, message)
                                }
                            })   
                        } else {
                            callback(false, message)
                        }
                    })
                } else {
                    delete newAdmin.create_by;
                    create(newAdmin, (isCreate, message, result) => {
                        if (isCreate) {
                            callback(true, message, result)
                        } else {
                            callback(false, message)
                        }
                    })               
                }
               
            }
        }) 
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la crétaion d'un admin : " +err)
    }
}

function create(newAdmin, callback) {
    collection.value.insertOne(newAdmin, (err, result) => {
        if (err) {
            callback(false, "Une erreur est survenue lors de la création de l'administrateur : " +err)
        } else {
            if (result) {
                callback(true, "L'administrateur a été créé", result.ops[0])
            } else {
                callback(false, "Aucune insertion")
            }
        }
    })
}

/**
 * Le module qui permet de trouver les infos d'un admin via son id
 */
module.exports.findOneById = (id, callback) => {
    try {
        collection.value.findOne({
            "_id": require("mongodb").ObjectId(id),
            "flag": true
        }, (err, result) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la récupération des informations : " +err)
            } else {
                if (result) {
                    callback(true, "L'admin a été retrouvé", result)
                } else {
                   callback(false, "Aucun administrateur ne porte cet identifiant : " + id) 
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des informations : " + exception)        
    }
}

/**
 * Le module qui permet à un administrateur de se connecter sur son compte
 */
module.exports.login = function (valeur_username, password, callback) {

    try {

        collection.value.aggregate([{
            "$match": {
                "username": valeur_username,
                "flag": true
            }
        },
        {
            "$project": {
                "password": 1,
                "username": 1
            }
        }
        ]).toArray(function (errAggr, resultAggr) {

            if (errAggr) {
                callback(false, "Une erreur est survenue lors de la connexion de l'administrateur : " + errAggr);
            } else {

                if (resultAggr.length > 0) {

                    var clearPwd = "AdminJa" + password + "chAdmin";

                    bcrypt.compare(clearPwd, resultAggr[0].password, function (errCompareCrypt, resultCompareCrypt) {


                        if (errCompareCrypt) {
                            callback(false, "Une erreur est survenue lors du décryptage du mot de passe : " + errCompareCrypt);
                        } else {
                            if (resultCompareCrypt) {

                                var objetRetour = {
                                        "id_admin": "" + resultAggr[0]._id,
                                        "username": resultAggr[0].username
                                    };

                                callback(true, "Administrateur connecté", objetRetour)

                            } else {
                                callback(false, "Le mot de passe est incorrect");
                            }
                        }
                    });

                } else {
                    callback(false, "Username incorrect");
                }
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lors de la connexion de l'administrateur : " + exception);
    }
}