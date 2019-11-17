module.exports.Interest = function Interest() {
    return {
        "id_user": String,
        "id_owner": String,
        "id_immo": String,
        "mode": "Set",
        "type": "Interest",
        "created_at": new Date()
    }
}

module.exports.Notification = function Notification() {
    return {
        "id_owner": String, //Affecté à id_user si null pour l'admin sinon pour le propriétaire,
        "id_user": String, 
        "id_immo": String, // A propos de quoi => id_immo
        "read": false,
        "typeNotif": String,
        "type": "Notification",
        "created_at": new Date()
    }
}

//Pour le favoris
module.exports.Favorite = function Favorite() {
    return {
        "id_immo": String,
        "id_user": String,
        "flag": true,
        "mode": "Set",
        "type": "Favorite",
        "created_at": new Date()
    }
}