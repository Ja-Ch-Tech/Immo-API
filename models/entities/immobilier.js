module.exports.Immobilier = function Immobilier() {
    return {
        surface: Number,
        nbrePiece: Number,
        images: Array, /** => {lien_images, name} */
        id_type_immo: String,
        id_mode_immo: String,
        id_user: String,
        id_adresse: String,
        description: String,
        flag: false,
        created_at: new Date()
    }
}