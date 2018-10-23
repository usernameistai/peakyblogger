// middleware
var Walk        = require("../models/walk"),
    User        = require("../models/user"),
    middlwObj   = {};

middlwObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "I'm sorry Dave, you need to be logged in to do that");
    res.redirect("/login");
};

middlwObj.checkWalkOwn = function(req, res, next){
    if(req.isAuthenticated()){
        Walk.findById(req.params.id, function(err, foundWalk){
            if(err || !foundWalk){
                req.flash("error", "Walk not found, very sorry..");
                res.redirect("/walks");
            } else if(foundWalk.author.id.equals(req.user._id) || req.user.isAdmin){
                req.walk = foundWalk; // added afterwards , changed to if, else if, else
                next();
            } else {
                req.flash("error", "I'm sorry Dave, you don't have permission to do that.  .");
                res.redirect("back");
            } 
        });
    } else {
        req.flash("error", "I'm sorry Dave, you need to be logged in to do that");
        res.redirect("back");
    } 
};

// below added afterwards
middlwObj.checkRevOwn = function(req, res, next) {
    if(req.isAuthenticated()){
        Review.findById(req.params.review_id, function(err, foundReview){
            if(err || !foundReview){
                res.redirect("back");
            }  else {
                // does user own the comment?
                if(foundReview.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlwObj.checkRevExist = function (req, res, next) {
    if (req.isAuthenticated()) {
        Walk.findById(req.params.id).populate("reviews").exec(function (err, foundWalk) {
            if (err || !foundWalk) {
                req.flash("error", "Walk not found.");
                res.redirect("back");
            } else {
                // check if req.user._id exists in foundCampground.reviews
                var foundUserReview = foundWalk.reviews.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("back");
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};

module.exports = middlwObj;