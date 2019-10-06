//Appelle à la base de données
var db_js = require("./db");

var collection = {
    value: null
}

module.exports.initialize = function (db_js) {

    collection.value = db_js.get().collection("media");
}

/**
 * Module permettant d'ajouter un media
 * @param {Object} newMedia L'objet a insérer
 * @param {Function} callback La fonction de retour
 */
module.exports.create = (newMedia, callback) => {
    try {
        collection.value.insertOne(newMedia, (err, result) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de l'insertion d'un Media : " +err)
            } else {
                if (result) {
                    callback(true, "Media créer avec succès", result.ops[0])
                } else {
                    callback(false, "Media non-créé")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de l'insertion d'un Media : " +err)        
    }
}

/**
 * Module permettant de récupérer l'image pour un produit
 * @param {Object} product Le produit qu'on doit retrouvé son image
 * @param {Function} callback La fonction de retour
 */
module.exports.findImageForUser = (user, callback) => {
    try {
        var filter = {
            "_id": require("mongodb").ObjectId(user.lien_profil)
        };
        
        collection.value.aggregate([
            {
                "$match": filter
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la recupération de l'image : " + err, user)
            } else {
                if (resultAggr.length > 0) {
                    user.image = resultAggr[0];
                    callback(true, "Image trouvé", user)
                } else {
                    callback(false, "Aucune image pour ce produit", user)
                }
            }
        })
    } catch (exception) {
        
    }
}

module.exports.getInfoForThisUserAndThisPublish = (objet, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "_id": require("mongodb").ObjectId(objet.images[0].lien_images)
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur lors de la recherche de l'image : " +err, objet)
            } else {
                if (resultAggr.length > 0) {
                    objet.detailsImage = resultAggr[0];
                    
                    callback(true, "L'image y est", objet)
                } else {
                    callback(false, "Aucune image à ce propos", objet)
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception est lévée lors de la recherche de l'image : " + exception, objet)        
    }
}