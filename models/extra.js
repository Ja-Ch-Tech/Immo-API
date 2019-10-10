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
                                callback(true, "L'ajout dans l'archive y est", result.ops[0])
                            } else {
                                callback(false, "L'insertion n'a pas été faites")
                            }
                        }
                    })
                } else {
                    callback(false, "A déjà été assigné")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une excetpion a été lévée lors de l'ajout dans l'archive : " + exception)        
    }
}