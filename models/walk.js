var mongoose = require("mongoose");

var walkSchema = new mongoose.Schema({
    name: String,
    image: String,//image: String,
    imageId: String,
    description: String,
    journey: String,
    foodplace: String,
    opinion: String,
    url: String,
    file: String,
    email: String,
    message: String,
    phone: String,
    createdAt: { 
        type: Date,
        default: Date.now
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});

module.exports = mongoose.model("Walk", walkSchema);