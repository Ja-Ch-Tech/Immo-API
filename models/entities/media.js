module.exports.Media = function Media() {
    return {
        name: String,
        path: String,
        size: Number,
        created_at: new Date()
    }
}