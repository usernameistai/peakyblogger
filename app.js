require("dotenv").config();

const express         = require("express");
const app             = express();
const bodyParser      = require("body-parser");
const mongoose        = require("mongoose");
const passport        = require("passport");
const cookieParser    = require("cookie-parser");
const LocalStrategy   = require("passport-local");
const flash           = require("connect-flash");
const Walk            = require("./models/walk");
const User            = require("./models/user");
const methodOverride  = require("method-override");

const walkRoutes      = require("./routes/walks");
const authRoutes      = require("./routes/auth");
constauthRoutes      = require("./routes/auth");

const dburl = process.env.MONGO_URL || 'mongodb://localhost:27017/pb';

mongoose.connect('mongodb://localhost:27017/pb', {useNewUrlParser: true, useUnifiedTopology: true});
    // .then(() => console.log('Mongo connect for dbs is connected'))
    // .catch((err) => { console.log('Oh blimey master, Mongo Connection Error'); console.log(err) })

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => { console.log("Dad's Database is connected") });

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