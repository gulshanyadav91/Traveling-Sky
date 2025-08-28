const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

//for IMAGE UPLOADING
const multer = require("multer");

const { storage } = require("../cloudConfig");

const upload = multer({ storage });

// from CONTROLLER
const listingController = require("../controllers/listings.js");
//INDEX ROUTE
//index route where we send the particular detail of the every user with the help of the
//  find method and then render it in the index page of the listings folder and we will get the it from listing/:id route

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );
// .post(upload.single("listing[image]"), (req, res) => {
//   res.send(req.file);
// });

//create new listings  NEW ROUTE
router.get("/new", isLoggedIn, listingController.renderNewForm);

//Show route

// taking the value from the form and saving it into the database and redirecting back to the home page
//and it is basically Create Route and having the post request

// after a long time we will add to handle the error so we add here the try catch block and we will pass the err as an argument to the next function which is written below.

// after learning different ways to handle the error we will use the wrapAsync function which is present in the utils folder and we will pass the callback function as an argument to it and it will return a promise and we will use the await keyword before it and it will execute only if there is no error otherwise it will go to the next middleware which is present below.

//Edit route  this is used to edit the details of a particular user and it has the get request and it will show us the form which we have created in the edit.ejs file
//it is present inside the listings folder inside the edit.ejs file

// UPDATE route which is used to update the details of a particular user and it has the put request and
// it will take the values from the edit.ejs file and save it into the database

// router will help us for the clarity of the code

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

//delete route which is used to delete the details of a particular user and it has the delete request and
//and it will delete the details of a particular user and redirect to the home page

router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
