var mongoose = require("mongoose"),
    Walk     = require("./models/walk");

var data = [
    {
        name: "Fun Walking",
        image: "/images/pine_trees.jpg",
        description: "Wlaking walking wooking",
        journey: "here to there",
        foodplace:"the plump sheep",
        opinion: "lovely place, beer good too",
        url: "www.theplumpsheep.com"
    },
    {
        name: "Fun Walking",
        image: "/images/beer_barrel.jpg ",
        description: "Wlaking walking wooking",
        journey: "there to here",
        foodplace: "cavendish arms",
        opinion: "gourmet dining at the end of a lovely walk",
        url: "www.cavendisharms.com"
    },
    {
        name: "Fun Walking",
        image: "/images/Dad_Design_1.jpg",
        description: "Wlaking walking wooking",
        journey: "uphill and downhill, valleys and walls",
        foodplace: "the traveller and trail-end",
        opinion: "lovely place",
        url: "www.tte.com"
    }
];

function seedDB(){
    // remove all walks
    Walk.remove({}, function(err){
        if(err){
            console.log(err);
        } else {
            console.log("removed walks");
            // add a few walks
            data.forEach(function(seed){
                Walk.create(seed, function(err, walk){
                    if(err){
                        console.log(err);
                    } else {
                        console.log(walk);
                        walk.save();
                        console.log("saved the walk");
                    }
                });
            });
        }
    });
}

module.exports = seedDB;