var db = require("./db");

var collection = {
    value: null
}

module.exports.initialize = (db) => {

    collection.value = db.get().collection("contact");
}

module.exports.create = (newContact, callback) => {
    try {
        collection.value.insertOne(newContact, (err, result) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la définition du contact : " +err)
            } else {
                if (result) {
                    callback(true, "Le contact a été enregistré", result.ops[0])
                } else {
                    callback(false, "Le contact n'a pas été enregistré")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la définition du contact : " + exception)        
    }
}

module.exports.getContacts = (objet, callback) => {
    try {
        collection.value.aggregate([
            {
                "$match": {
                    "id_owner": "" + objet._id
                }
            }
        ]).toArray((err, resultAggr) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la récupération des informations du proprio : " +err)
            } else {
                if (resultAggr.length > 0) {
                    objet.contacts = resultAggr;
                    callback(true, "Les contacts sonts là", objet);
                } else {
                    objet.contacts = [];
                    
                    callback(false, "Aucun contact", objet)
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la récupération des informations du proprio : " + err)        
    }
}