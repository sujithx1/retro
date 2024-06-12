const express=require('express')




const adminRoute=express.Router()

// 


const setNoCacheHeaders = (req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
};

//1= using auth.islogin
// isLogin: Checks if a user is logged in. If yes, it lets them continue to the requested page. If not, it sends them to the login page.
// 2= using auth.islogout
// isLogout: Checks if a user is logged out. If yes, it lets them continue to the requested page. If not, it sends them to the home page.

const auth=require('../middleware/adminAuthentication')
const adminController=require('../controllers/adminController');
const isAuthenticated=require('../middleware/authenticate')
const categoryController=require('../controllers/categoryController')
// const userRoute = require('./usersRoute');
const productController=require('../controllers/productController')
const multer=require('../helpers/multer')
const couponController=require('../controllers/couponController')
const offerController=require('../controllers/offerController')



adminRoute.get('/home',auth.isLogin,setNoCacheHeaders,adminController.loadDashboard);
adminRoute.get('/download-orders-pdf',auth.isLogin,adminController.pdfDownlodedOrders)
// adminRoute.post('/dashboard',auth.isLogin,adminController.getDashboardData)
adminRoute.get('/ordersgraph', adminController.getOrdersGraphData);



// adimin
adminRoute.get('/',auth.isLogout,setNoCacheHeaders,adminController.login); // OK if this is the login page and users should be redirected if already logged in
adminRoute.post('/',auth.isLogout, adminController.veryfyLogin);// Ensures only logged-in users can access the dashboard
adminRoute.get('/adminlogout',auth.isLogin,adminController.logout)


// userslist get
adminRoute.get('/users',auth.isLogin,adminController.loadUsersList)
adminRoute.get('/users/search',auth.isLogin,adminController.loadUsersList)
adminRoute.get('/user-profile',auth.isLogin,adminController.LoaduserProfile)
adminRoute.get('/block-user',auth.isLogin,adminController.BlockUser)
adminRoute.get('/unblock-user',auth.isLogin,adminController.unBlockUser)


// category 
adminRoute.get('/category',auth.isLogin,categoryController.loadCategory)
adminRoute.post('/category',auth.isLogin,categoryController.addCategory)
adminRoute.get('/edit-category',auth.isLogin,categoryController.loadEditCategory)
adminRoute.post('/edit-category',auth.isLogin,categoryController.editCategory)
adminRoute.get('/delete-category',auth.isLogin,categoryController.deleteCategory)

// products
adminRoute.get('/product',auth.isLogin,productController.loadProductlist)
adminRoute.get('/addproduct', auth.isLogin, productController.loadaddProduct); // Ensures only logged-in users can access the add product page
adminRoute.post('/addproduct', auth.isLogin, multer, productController.addProduct); // Ensures only logged-in users can access the add product page
adminRoute.get('/product/edit',auth.isLogin,productController.loadEditproduct)
adminRoute.post('/product/edit',auth.isLogin,multer,productController.editProduct)
adminRoute.get('/product/delete',auth.isLogin,productController.deleteProduct)
adminRoute.get('/product/add',auth.isLogin,productController.unblockProduct)

adminRoute.get('/orderlist',auth.isLogin,adminController.loadOrderList) 
adminRoute.post('/orders/status',auth.isLogin,adminController.StatusChanging)
adminRoute.get('/order-detail',auth.isLogin,adminController.loadOrderDetials)
adminRoute.put('/order/detail/OrderStatus/:orderId',auth.isLogin,adminController.orderDetailsUpdateStatus)


adminRoute.get('/coupons',auth.isLogin,couponController.loadCoupons)
adminRoute.get('/addcoupons',auth.isLogin,couponController.loadaddCoupons)
adminRoute.post('/addcoupons',auth.isLogin,couponController.addCoupons)
adminRoute.get('/coupon/edit',auth.isLogin,couponController.loadEditCoupon)
adminRoute.post('/coupon/edit',auth.isLogin,couponController.EditCoupon)
adminRoute.post('/coupon/block/:id',auth.isLogin,couponController.blockandUnblockCoupon)

adminRoute.get('/offer',auth.isLogin,offerController.loadOffer)
adminRoute.get('/offer/product/add',auth.isLogin,offerController.loaaddProductOfer)
adminRoute.post('/offer/product/add',auth.isLogin,offerController.addProductOfer)
adminRoute.post('/offer/apply',auth.isLogin,offerController.applayOfferByproduct)
adminRoute.post('/offer/remove',auth.isLogin,offerController.removeOfferByproduct)
adminRoute.get('/offer/edit',auth.isLogin,offerController.loadEditOffer)
adminRoute.post('/offer/edit',auth.isLogin,offerController.EditOffer)
adminRoute.get('/offer/category/add',auth.isLogin,offerController.loadAddCategoryOffer)
adminRoute.post('/offer/category/add',auth.isLogin,offerController.AddCategoryOffer)

adminRoute.delete('/product/remove-image',multer ,auth.isLogin,productController.productEditRemove)


adminRoute.get('/statistics',auth.isLogin,adminController.loadStatics)

     

// adminRoute.get()

module.exports=adminRoute





    