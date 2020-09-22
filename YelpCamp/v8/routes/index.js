// ===============================
// catch all for non-specific routes:
// Landing page
// Authentication
// ===============================

const express = require("express");
const router = express.Router();
const passport    = require("passport");

// import DB models needed
const User = require("../models/user");

// Landing page
router.get("/", (req, res) => {
    // res.send("This will be the Landing page");
    res.render("landing")   // landing.ejs
})



// =============
// AUTH ROUTES
// =============

// 1. REGISTER
// show register form
router.get("/register", function(req, res){
    res.render("register");
});

// handle sign up / register logic
router.post("/register", function(req, res){
    const newUser = new User({username : req.body.username});   
    // res.send("Signing you up");
    User.register(  newUser,
                    req.body.password,
                    function(err, user){
                        if(err) {
                            console.log(err);
                            return res.redirect("/register");   // short-circuits the code below if error occurs
                        }
                        // when the user successfully signs up, log the user in (.authenticate) and redirect to the campgrounds page
                        passport.authenticate("local")(req, res, function(){
                            console.log(`registration successful: ${user.username} logged in.`);
                            res.redirect("/campgrounds");
                        });                        
                    });
});

// 2. LOG IN
// show the log in form
router.get("/login", function(req, res){
    res.render("login");
});

// handle login logic
// app.post("/login", middleware, callback)
router.post(   "/login",
            passport.authenticate(  "local",
                                    {   // redirects object
                                        successRedirect : "/campgrounds",
                                        failureRedirect : "/login"
                                    }),         
            function(req, res){
                // res.send("I will log you in soon.")
                // console.log(`user: ${req.body.username} logged in successfully.`);
            }
);

// 3. LOG OUT
router.get("/logout", function(req, res){
    req.logout();
    console.log(`user logged out successfully.`);
    res.redirect("/campgrounds");
});

// middleware to restrict access
function isLoggedIn(req, res, next){
    
    if(req.isAuthenticated()){
        console.log("User is authenticated, and good to go");
        return next();  
    }
    // if user is not authenticated, don't allow access and redirect to the login page
    console.log("Opps. Hold up! User is not authenticated.");
    res.redirect("/login")

}

// export these modules to be used by app.js
module.exports = router;