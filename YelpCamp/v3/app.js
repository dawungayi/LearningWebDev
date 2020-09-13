// Yelpcamp v2: Adding data persistence
// to start a MongoDB service/daemon: $ brew services start mongodb-community@4.4
// to stop the service: $ brew services stop mongodb-community@4.4


// declare packages used - stylistic aligning
const   express     = require("express");
        app         = express();
        bodyParser  = require("body-parser");
        mongoose    = require("mongoose");
        seedDB      = require("./seeds");
        
// import DB models
const Campground = require("./models/campground");


// init express
app.set("view engine", "ejs");  // skip all .ejs file extensions in routes
// tell express to use the public/ directory, which will contain our front-end styling: css, js & bootstrap
// so all html <link> tags in the head will point to public/...
app.use(express.static("public"));
// init body-parser  - for pssing objects b/w front-end and back-end 
app.use(bodyParser.urlencoded({extended : true}));

// init mongoose for MongoDB
// should this be "mongodb://localhost:27017/yelp_camp" instead (as per mongoodes docs?)
mongoose.connect("mongodb://localhost/yelp_camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Connected to the Yelpcamp DB"))
.catch(error => console.log(error.message));

// seed the DB:
seedDB();

// init node server
const port = 3000;


// ROUTES
// Landing page
app.get("/", (req, res) => {
    // res.send("This will be the Landing page");
    res.render("landing")   // landing.ejs
})

// RESTful routes
/**
 * name         url             verb    desc
 * ============================================================
 * INDEX    /dogs           GET     Displays all dogs
 * NEW      /dogs/new       GET     Displays form to make a new dog
 * CREATE   /dogs           POST    Adds new dog to DB    
 * SHOW     /dogs/:id       GET     Shows info about one dog
 * 
 */

// INDEX
app.get("/campgrounds", (req, res) => {                 // REST format
    // get all cgs from db
    Campground.find((err, allCampgrounds) => {
        if(err) {
            console.log(err);
        } else {
            // allCampgrounds contains a list/array of all objects corresponding to the documents from the db
            res.render("index", {camps : allCampgrounds})
            // console.log((allCampgrounds));
        }
    });
});

// CREATE
app.post("/campgrounds", (req, res) => {                // REST format
    // get data from form and add to campgrounds[] array
    const campName = req.body.camp_name;
    const campImgUrl = req.body.image_url;
    const campDescription = req.body.description;
    const newCampground = {
        name : campName,
        image : campImgUrl,
        description : campDescription,
    };
    // console.log(newCampground);
    // create a new campground document and save to campgrounds collection in DB
    Campground.create(newCampground, (err, newlyCreated) => {
        if(err) {
            console.log(err);
        } else {
            console.log(`New Campground created: ${newlyCreated}`);
            // redirect back to /index page
            res.redirect("/index");  
        }
    });  // end of Campground.create 
});    // end of campground POST route

// NEW
// shows form that sends data to post route
app.get("/campgrounds/new", (req, res) => {                 // REST format
    res.render("new");
})

// SHOW
// shows more info on one campground
// make sure this is declared AFTER thee NEW route, since both have similar formats
app.get("/campgrounds/:id", (req, res) => {
    // find the campground with a specific id, which is passed from the <a> tag for this campground in the index page
    // we get req.params.id: from the xxxxx portion of the url: /campgrounds/xxxxx,
    // populate the comment data into foundCampground's _comments_ array 
    Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
        if(err) {
            console.log(err);
        } else {
            // console.log(foundCampground);
            // // render the show template for this foundCampground
            res.render("show", {showCampground : foundCampground});
            // console.log(req.params);
        }

    });     // end of findById callback
});     // end of SHOW route

// start server
app.listen(port, () => {
    console.log(`YelpCamp started at port: ${port}`);
})