require("dotenv").config();

var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    passport        = require("passport"),
    cookieParser    = require("cookie-parser"),
    LocalStrategy   = require("passport-local"),
    flash           = require("connect-flash"),
    Walk            = require("./models/walk"),
    User            = require("./models/user"),
    methodOverride  = require("method-override");

var walkRoutes      = require("./routes/walks"),
    authRoutes      = require("./routes/auth");


mongoose.connect("mongodb://dad:dbs127@ds119663.mlab.com:19663/dads-blogsite", {useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(cookieParser("secret"));
// seedDB();
app.locals.moment = require("moment");

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "One day I will achieve my dream",
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // with passporttlocalmonggoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", authRoutes);
app.use("/walks", walkRoutes);
// app.use("/walks/:id/reviews", reviewRoutes); // added after

app.listen(process.env.PORT || 3000, process.env.IP, () => {
    console.log("Dad's Blog is about to begin");
});