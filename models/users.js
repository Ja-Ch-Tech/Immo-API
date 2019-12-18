var db = require("./db"),
    bcrypt = require("bcryptjs");

var collection = {
    value: null
}

module.exports.initialize = (db) => {

    collection.value = db.get().collection("users");
}

/**
 * La fonction qui permet de créer un utilisateur
 */
module.exports.create = function (new_user, callback) {

    try { //Si ce bloc passe

        //On commence par crypter le mot de passe        
        var valeur_pwd = "Ja" + new_user.login.password + "ch";

        bcrypt.hash(valeur_pwd, 10, function (errHash, hashePwd) {

            if (errHash) { //Si une erreure survient lors du hashage du mot de passe
                callback(false, "Une erreur est survenue lors du hashage du mot de passe : " + errHash);
            } else { //Si non le mot de passe a été bien hashé

                new_user.login.password = hashePwd;
                new_user.id_adresse = null;

                testUsername(new_user, (isNotExist, message, result) => {
                    if (isNotExist) {
                        let type_users = require("./type_users");

                        type_users.initialize(db);
                        type_users.findOne(new_user.type, (isFound, messageType, resultType) => {
                            if (isFound) {
                                new_user.type = "" + resultType._id;
                                //On appele la méthode insertOne (une methode propre à mongoDB) de notre collection qui doit prendre la structure de l'entité
                                collection.value.insertOne(new_user, (err, result) => {

                                    //On test s'il y a erreur
                                    if (err) {
                                        callback(false, "Une erreur est survénue lors de la création de l'utilisateur", "" + err);
                                    } else { //S'il n'y a pas erreur

                                        //On vérifie s'il y a des résultat renvoyé
                                        if (result) {
                                            callback(true, "L'utilisateur est enregistré", result.ops[0])
                                        } else { //Si non l'etat sera false et on envoi un message
                                            callback(false, "Désolé, l'utilisateur non enregistrer")
                                        }
                                    }
                                })
                            } else {
                                callback(false, messageType)
                            }
                        })
                    } else {
                        callback(false, message, result)
                    }
                })

            }
        })


    } catch (exception) { //Si ce bloc ne passe pas on lève une exception
        callback(false, "Une exception a été lévée lors de la création de l'utilisateur : " + exception);
    }
}

function testUsername(objet, callback) {
    if (objet.login.username) {
        collection.value.aggregate([
            {
                "$match": {
                    "login.username": objet.login.username
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors du test de username : " + err)
            } else {
                if (resultAggr.length > 0) {
                    callback(false, "Celle-ci est déjà utilisé, nous vous suggérons", { suggest: [(objet.prenom + objet.nom + Math.ceil(Math.random() * 100)).toLowerCase(), (objet.prenom[0] + "." + objet.nom + Math.ceil(Math.random() * 100)).toLowerCase()] })
                } else {
                    callback(true, "Autorisation accordé")
                }
            }
        })
    } else {
        callback(false, "Aucun username n'est spécifié, nous vous suggérons", { suggest: (objet.prenom + objet.nom + Math.ceil(Math.random * 100)) })
    }

}

/**
 * La fonction qui permet à un client de se connecter sur son compte
 */
module.exports.login = function (valeur_username, password, callback) {

    try {

        collection.value.aggregate([{
            "$match": {
                "login.username": valeur_username
            }
        },
        {
            "$project": {
                "login.password": 1,
                "type": 1
            }
        }
        ]).toArray(function (errAggr, resultAggr) {

            if (errAggr) {
                callback(false, "Une erreur est survenue lors de la connexion de l'utilisateur : " + errAggr);
            } else {

                if (resultAggr.length > 0) {

                    var clearPwd = "Ja" + password + "ch";

                    bcrypt.compare(clearPwd, resultAggr[0].login.password, function (errCompareCrypt, resultCompareCrypt) {


                        if (errCompareCrypt) {
                            callback(false, "Une erreur est survenue lors du décryptage du mot de passe : " + errCompareCrypt);
                        } else {
                            if (resultCompareCrypt) {

                                var id_client = "" + resultAggr[0]._id,
                                    type = resultAggr[0].type,
                                    objetRetour = {
                                        "id_client": id_client,
                                        "type": type
                                    };

                                var logs = require("./log");

                                logs.initialize(db);

                                //La sauvegarde de la connexion d'un client
                                logs.saveLogin(objetRetour.id_client, (isSave, message, resultSave) => {
                                    callback(true, "Utilisateur connecté", objetRetour)
                                })


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
        callback(false, "Une exception a été lors de la connexion de l'utilisateur : " + exception);
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
            callback(false, "Une erreur dans la fonction de recupération d'un client : " + err)
        } else {
            if (resultAggr.length > 0) {
                callback(true, "Il a été trouvé", resultAggr[0])
            } else {
                callback(false, "Aucun utilisateur n'occupe cet identifiant")
            }
        }
    })
}

//Pour la mise à jour de l'adresse
module.exports.upAdresse = (id_user, newAdresse, callback) => {
    try {
        findOneById(id_user, (isFound, messageUser, resultUser) => {
            if (isFound) {

                var adresse = require("./adresse");

                adresse.initialize(db);
                adresse.create(newAdresse, (isCreated, messageAdresse, resultAdresse) => {
                    if (isCreated) {
                        collection.value.updateOne({
                            "_id": require("mongodb").ObjectId("" + resultUser._id)
                        }, {
                            "$set": {
                                "id_adresse": "" + resultAdresse._id
                            }
                        }, (err, result) => {
                            if (err) {
                                callback(false, "Une erreur est survenue lors de la mise à jour de l'adresse : " + err)
                            } else {
                                if (result) {
                                    callback(true, "Voilà l'adresse a été mise à jour", result)
                                } else {
                                    callback(false, "La mise à jour n'a pas été faite")
                                }
                            }
                        })
                    } else {
                        callback(false, messageAdresse)
                    }
                })

            } else {
                callback(false, messageUser)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise à jour de l'adresse : " + exception)
    }
}

/**
 * Module permettant de définir l'image du produit
 * @param {Object} props L'ensemble des propriété
 * @param {Function} callback La fonction de retour
 */
module.exports.setImage = (props, callback) => {
    try {
        var entity = require("./entities/media").Media(),
            media = require("./media");

        entity.name = props.name;
        entity.size = props.size;
        entity.path = props.path;

        media.initialize(db);
        media.create(entity, (isCreated, message, resultMedia) => {
            if (isCreated) {
                var filter = {
                    "_id": require("mongodb").ObjectId(props.id_user)
                },
                    update = {
                        "$set": {
                            "lien_profil": "" + resultMedia._id
                        }
                    };

                collection.value.updateOne(filter, update, (err, resultUpdate) => {
                    if (err) {
                        callback(false, "Une erreur est survenue lors de la mise à jour de l'image de cet utilisateur : " + err)
                    } else {
                        if (resultUpdate) {
                            callback(true, "Mise à jour a été faite", resultUpdate)
                        } else {
                            callback(false, "La mise à jour n'a pas abouti")
                        }
                    }
                })
            } else {
                callback(false, message)
            }
        })


    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise à jour de l'image de cet utilisateur : " + exception)
    }
}

//Test de compte
module.exports.testAccount = (objet, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "_id": require("mongodb").ObjectId(objet.id_user)
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur de détermination de type de compte : " + err)
            } else {
                if (resultAggr.length > 0) {
                    let type_users = require("./type_users");

                    type_users.initialize(db);
                    type_users.isOwners(resultAggr[0].type, (isOwner, messageOwner) => {
                        if (isOwner) {
                            callback(true, messageOwner)
                        } else {
                            callback(false, messageOwner)
                        }
                    })
                } else {
                    callback(false, "Le user nous est inconnu")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception de détermination de type de compte : " + exception)
    }
}

module.exports.getInfoForThisUserAndThisPublish = (objet, callback) => {
    try {
        findOneById(objet.id_user, (isFound, message, resultUser) => {
            if (isFound) {
                objet.nomOwner = resultUser.nom;
                objet.prenomOwner = resultUser.prenom;
                objet.id_owner = resultUser._id;

                delete objet.id_user;

                var adresse = require("./adresse");

                adresse.initialize(db);
                adresse.getInfoForThisUserAndThisPublish(objet, (isGet, message, resultAdresse) => {
                    if (isGet) {
                        
                        var extra = require("./extra");

                        extra.initialize(db);
                        extra.isThisInFavorite(resultAdresse, (isDefine, message, resultWithFavorite) => {
                            callback(true, "L'adresse et les autres info y sont", resultWithFavorite)
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
        callback(false, "Une exception est lévée : " + exception)
    }
}

module.exports.upProfil = (objet, callback) => {
    try {
        var filter = {
            "_id": require("mongodb").ObjectId(objet.id)
        },
            update = {
                "$set": {
                    "nom": objet.nom,
                    "prenom": objet.prenom,
                    "login.username": objet.username
                }
            }
            ;

        collection.value.updateOne(filter, update, (err, result) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la mise à jour du profile : " + err)
            } else {
                if (result) {
                    callback(true, "La mise a abouti", result)
                } else {
                    callback(false, "Les indormations n'ont pas été mise à jour")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise à jour du profile : " + exception)
    }
}

module.exports.upPassword = (objet, callback) => {
    try {
        findOneById(objet.id, (isFound, message, result) => {
            if (isFound) {
                var clearPwd = "Ja" + objet.oldPassword + "ch";

                bcrypt.compare(clearPwd, result.login.password, function (errCompareCrypt, resultCompareCrypt) {

                    if (errCompareCrypt) {
                        callback(false, "Une erreur est survenue lors du décryptage du mot de passe : " + errCompareCrypt);
                    } else {
                        if (resultCompareCrypt) {

                            var valeur_pwd = "Ja" + objet.newPassword + "ch";
                            bcrypt.hash(valeur_pwd, 10, function (errHash, hashePwd) {
                                if (errHash) {
                                    callback(false, "Une erreur de cryptage y est rencontrée : " + errHash)
                                } else {
                                    var filter = {
                                        "_id": objet.id,
                                    },
                                        update = {
                                            "login.password": hashePwd
                                        };

                                    collection.value.updateOne(filter, update, (err, result) => {
                                        if (err) {
                                            callback(false, "Une erreur lors de la mise à jour du mot de passe : " + err)
                                        } else {
                                            if (result) {
                                                callback(true, "Le mot de passe a été mise à jour", result)
                                            } else {
                                                callback(false, "Le mdp n'a pas subit de modification")
                                            }
                                        }
                                    })
                                }
                            })

                        } else {
                            callback(false, "Le mot de passe ne correspond pas");
                        }
                    }
                });
            } else {
                callback(false, message)
            }
        })

    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la mise à jour du mot de passe : " + exception)
    }
}

//Permet de récupérer les infos d'un owner
module.exports.getInfoOwner = (objet, callback) => {
    try {
        module.exports.testAccount(objet, (isOwner, message) => {
            if (isOwner) {

                collection.value.aggregate([
                    {
                        "$match": {
                            "_id": require("mongodb").ObjectId(objet.id_user)
                        }
                    }
                ]).toArray((err, resultAggr) => {
                    if (err) {
                        callback(false, "Une eereur lors de la récupération des infos basique du owners : " + err)
                    } else {
                        if (resultAggr.length > 0) {
                            var adresse = require("./adresse");
                            resultAggr[0].isInLocation = true;

                            adresse.initialize(db);
                            adresse.findWithObjet(resultAggr[0], (isFound, message, resultAdresse) => {
                                var contact = require("./contact");

                                contact.initialize(db);
                                contact.getContacts(resultAdresse, (isGet, message, resultContact) => {
                                    //Ajouter Images
                                    callback(true, "Les infos du propriétaires sont là", resultContact)
                                })
                            })
                        } else {
                            callback("Aucune information sur lui, bizarre")
                        }
                    }
                })

            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des informations du propriétaire : " + exception)
    }
}

module.exports.getInfoForAnyUser = (id, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "_id": require("mongodb").ObjectId(id)
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur s'est introduite lors de la récupéartion des infos de ce user: " + err)
            } else {
                if (resultAggr.length > 0) {
                    var adresse = require("./adresse");

                    adresse.initialize(db);
                    adresse.findWithObjet(resultAggr[0], (isFound, message, resultAdresse) => {
                        callback(true, message, resultAdresse)
                    })
                } else {
                    callback(false, "Aucun n'utilisateur n'occupe cet id")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupéartion des infos de ce user: " + exception)
    }
}

module.exports.setContact = (contact, callback) => {
    try {
        findOneById(contact.id, (isOwner, message, resultOwner) => {
            if (isOwner) {
                var entity = require("./entities/contact").Contact(),
                    model = require("./contact");

                entity.email = contact.email;
                entity.telephone = contact.telephone;
                entity.id_owner = "" + resultOwner._id;

                model.initialize(db);
                model.create(entity, (isCreated, message, resultContact) => {
                   callback(isCreated, message, resultContact)
                })      
            } else {
                callback(false, message)
            }
        })
    } catch (exception) {
        
    }
}