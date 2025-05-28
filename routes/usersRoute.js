const express = require("express");
const userRoute = express.Router();

// middleware cinnect
const auth = require("../middleware/usersAuthentication");
// UserControllerConnect
const userController = require("../controllers/usersController");
const cartContrller = require("../controllers/cartController");
const orderController = require("../controllers/orderController");
const wishlistController = require("../controllers/wishlistController");
const couponController = require("../controllers/couponController");
const referalController = require("../controllers/referalController");

const setNoCacheHeaders = (req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
};

// User loadingHome page
const passport = require("passport");
require("../helpers/oAuth");

userRoute.use(passport.initialize());

userRoute.use(passport.session());

userRoute.get("/", setNoCacheHeaders, userController.loadlandingPage);
// home page rendering
userRoute.get(
  "/home",
  auth.isLoggedIn,
  setNoCacheHeaders,
  userController.loadhome
);

// user login page
userRoute.get(
  "/login",
  auth.isLoggedOut,
  setNoCacheHeaders,
  userController.loadLogin
);
// user signup page
userRoute.get("/signup", userController.loadSignup);

userRoute.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

// console.log("googole callback ", userController.googleCallback);
userRoute.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/success",
    failureRedirect: "/failure",
  })
);
// console.log("googole callback ", userController.googleCallback);

// userRoute.get('/profile',oAuth)
userRoute.get("/success", userController.loadSuccesGoogle);

userRoute.get("/failure", userController.loadFailurGoogle);
// inserting users
userRoute.post("/signup", userController.insertUser);
// verification otppage loade
userRoute.get("/verification", auth.isLoggedOut, userController.loadOTP);
// verifiacrion verify otp
userRoute.post("/verification", auth.isLoggedOut, userController.verifyOtp);
// resend otp
userRoute.post("/resend-otp", userController.resendOtp);
// login verify

userRoute.post("/login", auth.isLoggedOut, userController.verifyLogin);

// logout
userRoute.get("/logout", auth.isLoggedIn, userController.LoggedOut);
// forgetPassword loading
userRoute.get("/forget-password", userController.Loadforgot);
// forgtet password sending mail
userRoute.post("/forget-password", userController.forget_password);
// reseting password loading
userRoute.get("/reset-password", userController.LoadReset_password);
// setting new password
userRoute.post("/reset-password", userController.reset_password);

userRoute.get("/shop", userController.LoadShop);
userRoute.post(
  "/product/detail",
  auth.isLoggedIn,
  userController.notifyProduct
);
userRoute.get(
  "/product/detail",
  auth.isLoggedIn,
  userController.loadproductDetails
);

userRoute.get("/profile", auth.isLoggedIn, userController.loadProfile);
userRoute.get(
  "/profile/account/edit",
  auth.isLoggedIn,
  userController.loaduserEdit
);
userRoute.post(
  "/profile/account/edit",
  auth.isLoggedIn,
  userController.EditUser
);
userRoute.get(
  "/profile/account/changepassword",
  auth.isLoggedIn,
  userController.loadChangepassword
);
userRoute.post(
  "/profile/account/changepassword",
  auth.isLoggedIn,
  userController.changePassword
);
userRoute.get(
  "/profile/address/add",
  auth.isLoggedIn,
  userController.loadaddAddress
);
userRoute.post(
  "/profile/address/add",
  auth.isLoggedIn,
  userController.addAddress
);
userRoute.get(
  "/profile/address/edit",
  auth.isLoggedIn,
  userController.loadAddressEdit
);
userRoute.post(
  "/profile/address/edit",
  auth.isLoggedIn,
  userController.editAddress
);
userRoute.post(
  "/profile/address/remove",
  auth.isLoggedIn,
  userController.removeAddress
);
userRoute.get(
  "/profile/address/setDefault",
  auth.isLoggedIn,
  userController.setDefaultAddress
);
userRoute.put(
  "/profile/orders/cancel",
  auth.isLoggedIn,
  userController.cancelOrder
);
userRoute.post(
  "/profile/orders/return",
  auth.isLoggedIn,
  userController.return_order
);
userRoute.put(
  "/profile/referal",
  auth.isLoggedIn,
  referalController.sendreferal
);
userRoute.get(
  "/profile/orders/detail",
  auth.isLoggedIn,
  userController.loadoderDetails
);

userRoute.get("/product/cart", auth.isLoggedIn, cartContrller.loadShopCart);
userRoute.post("/product/addToCart", auth.isLoggedIn, cartContrller.AddtoCart);
userRoute.delete(
  "/product/cart/remove",
  auth.isLoggedIn,
  cartContrller.removeCartProduct
);
userRoute.get("/product/clearcart", auth.isLoggedIn, cartContrller.clearCart);
userRoute.post(
  "/product/cart/quantity",
  auth.isLoggedIn,
  cartContrller.ChangeQuantity
);

userRoute.post("/product/order", auth.isLoggedIn, orderController.loadOder);
userRoute.get("/product/order", auth.isLoggedIn, orderController.loadOder);
userRoute.get(
  "/product/address/edit",
  auth.isLoggedIn,
  orderController.loadEditAddress
);
userRoute.post(
  "/product/address/edit",
  auth.isLoggedIn,
  orderController.Editaddress
);
userRoute.post(
  "/product/order/newaddress",
  auth.isLoggedIn,
  orderController.newAddress
);
userRoute.post(
  "/product/order/payment",
  auth.isLoggedIn,
  orderController.cartOrderPayment
);
userRoute.post(
  "/product/order/razorpay",
  auth.isLoggedIn,
  orderController.razorypay_payment
);
userRoute.post(
  "/verify-payment",
  auth.isLoggedIn,
  orderController.verify_Payment
);
userRoute.post(
  "/product/order/wallet",
  auth.isLoggedIn,
  orderController.walllet_payment
);
userRoute.get(
  "/payment-failure",
  auth.isLoggedIn,
  orderController.payment_failure
);
userRoute.delete(
  "/delete/order/",
  auth.isLoggedIn,
  orderController.deleteOrder
);

userRoute.get("/wishlist", auth.isLoggedIn, wishlistController.loadWishlist);
userRoute.post(
  "/product/wishlist/add",
  auth.isLoggedIn,
  wishlistController.addtoWishlist
);
userRoute.delete(
  "/wishlist/product/remove",
  auth.isLoggedIn,
  wishlistController.removeWishlistProduct
);

userRoute.put(
  "/coupon/apply",
  auth.isLoggedIn,
  couponController.ApplayingCoupon
);
userRoute.get("/coupon/used", auth.isLoggedIn, couponController.userUsedCoupon);
userRoute.put("/coupon/remove", auth.isLoggedIn, couponController.removeCoupon);
userRoute.get("/order/invoice", auth.isLoggedIn, userController.loadInvoice);
userRoute.post(
  "/product/rating",
  auth.isLoggedIn,
  userController.sumbmitReview
);

module.exports = userRoute;
