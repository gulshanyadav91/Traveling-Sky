const User = require("../models/user");
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};
module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};
module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    // console.log(username, email, password);
    const newUser = new User({ email, username });
    const registeredUser = await User.register(
      newUser,
      password
    ); /* this is used to save the data */
    console.log(registeredUser);

    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to WanderLust");
      res.redirect("/listings");
    });
  } catch (err) {
    console.log(err);
    req.flash("error", err.message);
    res.redirect("/signup");
  }
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome to the Wanderlust");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged Out!");
    res.redirect("/listings");
  });
};
