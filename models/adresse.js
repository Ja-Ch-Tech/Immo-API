
var db = require("./db");

var collection = {
    value: null
}

module.exports.initialize = (db) => {

    collection.value = db.get().collection("adresse");
}

//Ajout d'une adresse
module.exports.create = (newAdresse, callback) => {
    try {
        collection.value.insertOne(newAdresse, (err, result) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de l'insertion de l'adresse : " +err)
            } else {
                if (result) {
                    callback(true, "L'adresse est inséré", result.ops[0])
                } else {
                    callback(false, "L'insertion n'a pas abouti")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de l'insertion de l'adresse : " + exception)        
    }
}
