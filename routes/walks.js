var express     = require("express"),
    router      = express.Router(),
    Walk        = require("../models/walk"),
    middlw      = require("../middleware"), // index special name
    multer      = require("multer"); // added from here to..

// --------------------------------------------------------------
var storage = multer.diskStorage({ // storage variable
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
};          // to here (below) is the multer stuff
var upload = multer({ storage: storage, fileFilter: imageFilter}); 

var cloudinary = require("cloudinary");
cloudinary.config({ 
    cloud_name: 'future-source', 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
}); // ------------------------------------------------------------ .. to here
    
// Index Show All Walks
router.get("/", function(req, res){
    var perPage = 5;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    var noMatch = null;
    if(req.query.search){ // search stuff below
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Walk.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allWalks){
            Walk.count({name: regex}).exec(function (err, count){
                if(err){
                    console.log(err);
                    res.redirect("back");
                } else {
                    if(allWalks.length < 1){
                        noMatch = "No walks match that, sorry";
                        req.flash("error", "Sorry, no walks match your search");
                        return res.redirect("/walks");
                    } 
                    res.render("walks/walk", {
                        walks: allWalks,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: req.query.search
                    }); 
                }
            });  
        });
    } else {
        //get all walk routes from db
        Walk.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allWalks){
            Walk.count().exec(function (err, count){
                if(err){
                    console.log(err);
                } else {
                    res.render("walks/walk", {
                        walks: allWalks,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: false
                    });
                }
            });    
        });
    }
});

// Create - add new walks to database    added upload
router.post("/", middlw.isLoggedIn, upload.single('image'), function(req, res){
    cloudinary.v2.uploader.upload(req.file.path, function(err, result){
        if(err){
            console.log("error" + err.message);
            req.flash("error", err.message);
        } else {
        // add cloudinary url for the image to the walk oject under image property
        req.body.image = result.secure_url;
        //add image's public_id to the walk object
        req.body.imageId = result.public_id;
        // add author to walk
        var name = req.body.name;
        var desc = req.body.description;
        var jour = req.body.journey;
        var food = req.body.foodplace;
        var opin = req.body.opinion;
        var url = req.body.url;
        var author = {
            id: req.user._id,
            username: req.user.username
        };
        console.log(req.body.name + "==========");
        var newWalk = {name: name, image: req.body.image, imageId: req.body.imageId, description: desc, journey: jour, 
            foodplace: food, opinion: opin, url: url, author: author};
        Walk.create(newWalk, function(err, walk){
            if(err){
                req.flash("error", "unable to complete new walk Dave!!");
                return res.redirect("/walks");
            } else {
                res.redirect("/walks/" + walk.id);
            }
        });
        } 
    });
});

//New Show form to create new walk
router.get("/new", middlw.isLoggedIn, function(req, res){ 
    res.render("walks/new");
});

// Show shows about an individual walk
router.get("/:id", function(req, res){
    // find walk with appropriate id. Add below for populating
    // Walk.findById(req.params.id).populate("comments").exec(function(err, foundWalk
   Walk.findById(req.params.id, function(err, foundWalk){
    if(err){
        console.log(err);
    } else {
        // render show template with the walk
        res.render("walks/show", {walk: foundWalk});
    }
   });
});

// Edit Walks Route
router.get("/:id/edit", middlw.checkWalkOwn, function(req, res){
    Walk.findById(req.params.id, function(err, foundWalk){
        res.render("walks/edit", {walk: foundWalk});
    });
});

// Update Walk Route            might have to remove req.body.walk
router.put("/:id", middlw.checkWalkOwn, upload.single('image'), function(req, res){
    Walk.findById(req.params.id, async function(err, walk){ // find and update correct walk
        if(err){
            req.flash("error", "Sorry Dave, unable to edit ..");
            res.redirect("back");
        } else {
            if(req.file){
                try {
                    await cloudinary.v2.uploader.destroy(walk.imageId);
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    walk.imageId = result.public_id; //walk.imageId
                    walk.image = result.secure_url; //walk.image
                } catch(err){
                    req.flash("error", "Sorry Dave, unable to edit walk..");
                    console.log(err.message + " _____editing error");
                    res.redirect("back");
                }
            }
            walk.name        = req.body.name;
            walk.description = req.body.description;
            walk.journey     = req.body.journey;
            walk.foodplace   = req.body.foodplace;
            walk.opinion     = req.body.opinion;
            walk.url         = req.body.url;
            walk.save();
            req.flash("success", "Successfully updated Dave");
            res.redirect("/walks/" + walk._id);
        }
    });
});

// Destroy walk route
router.delete("/:id", middlw.checkWalkOwn, function(req, res){
    Walk.findById(req.params.id, async function(err, walk){
        if(err){
            req.flash("error", "Sorry Dave, unable to delete ..");
            return res.redirect("back");
        }
        try {
            await cloudinary.v2.uploader.destroy(walk.imageId);
            walk.remove();
            req.flash("success", "You successfully deleted the post");
            res.redirect("/walks");
        } catch(err) {
            if(err){
                req.flash("error", "Sorry Dave, unable to delete ..");
                return res.redirect("back");
            } 
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;

     // old put route

     /*
     // Update Walk Route
router.put("/:id", middlw.checkWalkOwn, upload.single('image'), function(req, res){
    Walk.findByIdAndUpdate(req.params.id, req.body.walk, function(err, updatedWalk){ // find and update correct walk
        if(err){
            res.redirect("/walks");
        } else {
            res.redirect("/walks/" + req.params.id);
        }
    });
    //redirect somewhere show page
});
      */