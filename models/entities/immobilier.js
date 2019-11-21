module.exports.Immobilier = function Immobilier() {
    return {
        surface: Number,
        nbrePiece: Number,
        nbreChambre: Number,
        nbreDouche: Number,
        prix: Number,
        images: Array, /** => {lien_images, name} */
        id_type_immo: String,
        id_mode_immo: String,
        id_user: String,
        id_adresse: String,
        description: String,
        flag: true,
        validate: false,
        alredy_sold: false,
        declineStory: Array,
        created_at: new Date()
    }
}

/**
 * Collection de déclinaison d'une demande de publication de l'immobilier
 */
module.exports.DeclineRequest = function DeclineRequest() {
    return{
        id_admin: String,
        cause: String,
        flag: true,
        date: new Date()
    }
}