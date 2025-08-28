if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

// console.log(process.env.SECRET);

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
// flash is used to show the flash messages on the page and then it will be removed after some time
const flash = require("connect-flash");

// this is for the password hashing
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

//THESE ARE COMMITED BECAUSE THESE ARE USELESS NOW IN THIS PAGE
// const Listing = require("./models/listing.js");
// const wrapAsync = require("./utils/wrapAsync.js");
// const { listingSchema, reviewSchema } = require("./schema.js");
// const Review = require("./models/review.js");

//this is for the express router so that we can understand the code easily
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

//setUp for the ejs

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const dbUrl = process.env.ATLASDB_URL;

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.error("ERROR IN MONGO SESSION STORE", err);
});

//this is for the session for the flash messages
//coockie will store the data for 1 week 7 * 24 * 60 * 60 * 1000
const SESSION_SECRET = process.env.SECRET || "dev-secret-change-me";

const sessionOptions = {
  store,
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  // this will store the data upto 7 days from the starting days
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    // secure: true, // enable in production with HTTPS
  },
};

// app.get("/", (req, res) => {
//   res.send("this is the root route");
// });

//always write the session code before the flash code otherwise it will not work properly and write all the reoutes below these two codes
// always write the flashh code down the session code because if you write it up then it will not work properly
app.use(session(sessionOptions));
app.use(flash());

// this all are the 5 line for the passport authentication
//this is for the passport authentication always down the session code otherwise it will not work properly
app.use(passport.initialize());
app.use(passport.session()); //this is write here so that user don't have to enter the password for each request
passport.use(new LocalStrategy(User.authenticate())); // this method is used for login and signup and it will check whether the user is authenticated or not

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  //we can also do like this but it is not good practice
  //res.locals.success = req.flash('success');
  //res.locals.error=req.flash('error');
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user; // this is userd to stored the info about user who is currently logged in or not
  next();
});

app.use(async (req, res, next) => {
  //console.log(req.path)
  //console.log(req.query)
  if (!["/login", "/"].includes(req.path)) {
    req.session.returnTo = req.originalUrl; //original url is the url which is requested by the user
  }
  res.locals.currUser = req.user;
  next();
});

// this is used to authenticate the user by the passport and it will redirect to the home page if the user is logged in
// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({
//     email: "krishna@123",
//     username: "Krishna",
//   });

//   let registeredUser = await User.register(fakeUser, "helloworld"); // helloworld is a password and this register method will save the username and password in the database
//   res.send(registeredUser);
// });

//this is used for the express router we have to write this code so that we can use those all the routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

//this is the basic setUp for the MONGODB

main()
  .then(() => {
    console.log("connected to the mongoDb");
  })
  .catch((err) => {
    console.log(err);
  });

async function main(params) {
  await mongoose.connect(dbUrl);
}

// app.get("/testListing",async (req,res)=>{
//     let sampleList = new Listing({
//         title:"My new Villa",
//         description:"By the Beach",
//         price : 1200,
//         location:"Mau  (275101)",
//         country:"India",
//     });

//     await sampleList.save();
//     console.log("Sample is saved to the Db");
//     res.send("Succesfully data is inserted into the Db");

// })

// console.log("All are correctly connected successfully ");
// app.all("*", (req, res, next) => {
//   next(new ExpressError(404, "Page Not Found!"));
// });
// it is not working and i don't know why

//error handling middleware is used to handle the errors and it is present at the last of the code  so that it will be executed when any error occurs in the above routes.
app.use((err, req, res, next) => {
  let { statusCode = 500, message = " Something Went Wrong!" } = err;
  res.status(statusCode).render("error.ejs", { err });
  //   res.status(statusCode).send(message); //deconstruct the err so that we can access the statusCode and message separately
  //   res.send("Something went wrong");
});

app.listen(8080, () => {
  console.log("app is listening via port 8080");
});
