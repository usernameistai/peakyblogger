const express      = require("express");
const router       = express.Router();
const passport     = require("passport");
const nodemailer  = require("nodemailer");
const multer      = require("multer");
const Walk        = require("../models/walk");
const User         = require("../models/user");

const auth = {
    type: 'oauth2',
    user: process.env.GMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        auth,
        user: process.env.GMAIL_USER, // generated ethereal user
        pass: process.env.GMAIL_PASS // generated ethereal password
    },
    tls: {
        rejectUnauthorised: false
    }
});



// --------------------------------------------------------------
const storage = multer.diskStorage({ // storage constiable
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
const imageFilter = function (req, file, cb) {
// accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
};// to here (below) is the multer stuff
const upload = multer({ storage: storage, fileFilter: imageFilter}); 

const cloudinary = require("cloudinary");
cloudinary.config({ 
    cloud_name: 'future-source', 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
}); // ------------------------------------------------------------ .. to here

// root route
router.get("/", function(req, res){
    res.render("landing");
});
// home route
router.get("/home", function(req, res){
    res.render("walks/index");
});
// about route
router.get("/about", function(req, res){
    res.render("about");
});

// contact route
router.get("/contact", function(req, res){
    res.render("contact");
});

router.get("/contact/contactform", function(req, res){
    res.render("contactform");
});

router.get("/gallery", function(req, res){
    res.render("gallery");
});

router.get("/gallery/galleryform", function(req, res){
    res.render("galleryform");
});

router.post("/send", function(req, res){
    console.log(req.body);
    // setup email data with unicode symbols
    response = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        message: req.body.message
      };

    const mailOptions = {
        to: process.env.GMAIL_USER, 
        from: `req.body.email`,
        subject: 'New message from PeakyBlogger', // Subject line
        text: req.body.message, // plain text body
        html: `
        <p> You have a new contact request</p>
        <h3>Contact Details</h3>
        <ul>
            <li>Name: ${req.body.name}</li>
            <li>Email: ${req.body.email}</li>
            <li>Phone: ${req.body.phone}</li>
        </ul>
        <h3> Message</h3>
        <p>${req.body.message}</p>
        `
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(err, info) {
        if(err) {
            console.log(err);
        }
        req.flash("success", "your email has been sent");
        res.redirect("/home");
        console.log(JSON.stringify(info));
    });
});

// show register form
router.get("/register", function(req, res){
    res.render("register");
});

// handle sign up logic
router.post("/register", function(req, res){
    const newUser = new User({username: req.body.username}); // username and password from form
    if(req.body.admincode === process.env.ADMIN_CODE){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.render("register");
        }                                       // cb function once authenticates
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to Peaky Blogger's " + user.username);
            res.redirect("/walks");
        });
    });
});

// show login form
router.get("/login", function(req, res){
    res.render("login");
});

// handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/home", // passport middleware
        failureRedirect: "/login"
    }), function(req, res){
        if(passport.authenticate() === "true"){
            req.error("error", "Sorry, it appears you entered something wrongly");
        } else {
            req.success("success", "Nice to see you again");
        }
});

// Add logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out and see you soon ");
    res.redirect("/home");
});

module.exports = router;