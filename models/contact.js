var db = require("./db")
bcrypt = require("bcrypt");

var collection = {
    value: null
}

module.exports.initialize = (db) => {

    collection.value = db.get().collection("contact");
}

module.exports.getContactOwner = (objet, callback) => {
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
                    callback(true, "Les contacts sonts là");
                } else {
                    objet.contacts = [];
                    
                    callback(false, "Aucun contact", objet)
                }
            }
        })
    } catch (exception) {
        
    }
}