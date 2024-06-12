const User = require("../models/userModel");
const adminaModel = require("../models/adminModel");
const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const securePassword = require("../helpers/securePassword");
const Product = require("../models/productModel");
const PDFDocument = require('pdfkit');

const path = require('path');
const fs=require('fs')

const bcrypt = require("bcrypt");
// const { search } = require("../routes/adminRoute");
const Order = require("../models/orderModule");

// login page loading
const login = async (req, res) => {
  try {
    res.render("admin/signin");
  } catch (error) {
    console.log("error from admincontroller login", error);
  }
};
// predefault email and pass word setting
// const username='sujith@gmail.com'
// const Pass=123

// verifying login function
const  veryfyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    console.log(req.body.email);
    console.log(req.body.password);
    // console.log(username);
    // console.log(Pass);

    const userData = await User.findOne({ email: email });
    {
      if (userData) {
        const passwordMatch = await bcrypt.compareSync(
          password,
          userData.password
        );
        if (passwordMatch) {
          if (userData.isAdmin === 1) {
            // req.session.authenticated=true;
            req.session.admin = {
              _id: userData._id,
              email: email,
            };

            // req.session.pass = password; 

            res.redirect("/admin/home");
            console.log("rendering working ");
          } else {
            res.render("admin/signin", { msg: "Your Not Admin" });
          }
        } else {
          res.render("admin/signin", { msg: "Password is not match" });
        }
      } else {
        const msg = "email and password is doesent match";
        res.render("admin/signin", { msg });
        console.log("rendering not working ");
      }
    }
    // if(username==email && Pass==password)
    // {
    //     req.session.admin = username;
    //     req.session.pass = Pass;

    //     res.render('admin/dashboard')
    //     console.log('rendering working ');
    // }
  } catch (error) {
    console.log("error from Admin verify login ", error);
  }
};
const loadDashboard = async (req, res) => {
  try {


    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    

    const pastRevenue = await Order.aggregate([
        { $match: { 'products.date': { $gte: thirtyDaysAgo, $lt: today } } },
        { $unwind: "$products" },
        { $match: { 'products.date': { $gte: thirtyDaysAgo, $lt: today } } },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: { $multiply: ["$products.productPrice", "$products.quantity"] } }
            }
        }
    ]);

    const pasttotalRevenue = pastRevenue.length > 0 ? pastRevenue[0].totalRevenue : 0;
    console.log("Total Revenue in the Last 30 Days:", pasttotalRevenue);

    const result = await Order.aggregate([
        { $unwind: "$products" },
        { $count: "totalProductsCount" }
    ]);

    const totalProductsCount = result.length > 0 ? result[0].totalProductsCount : 0;
    console.log("Total Count of Products:", totalProductsCount);

    const completedProducts = await Order.aggregate([
        { $unwind: "$products" },
        { $match: { "products.product_orderStatus": "completed" } },
        { $replaceRoot: { newRoot: "$products" } }
    ]);

    const unique = await Order.aggregate([
        { $unwind: "$products" },
        { $group: { _id: "$products.productId" } },
        { $count: "uniqueProductCount" }
    ]);

    const uniqueProductCount = unique.length > 0 ? unique[0].uniqueProductCount : 0;
    console.log("Unique Product Count:", uniqueProductCount);

    let totalRevenue = 0;
    console.log("Completed Products:", completedProducts);

    completedProducts.forEach(product => {
        totalRevenue += product.productPrice;
        console.log("Product Price:", product.productPrice);
    });

    console.log("Total Revenue", totalRevenue);
  // Pagination variables
  let page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = Math.max(0, (page - 1) * limit);

    
    const { startDate, endDate, predefinedRange } = req.query;
    let dateFilter = {};

    const calculatePredefinedRange = (range) => {
        const now = new Date();
        let start, end = new Date();

        switch (range) {
            case 'oneDay':
                start = new Date(now.setDate(now.getDate() - 1));
                break;
            case 'oneWeek':
                start = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'oneMonth':
                start = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'oneYear':
                start = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                return null;
        }

        end.setHours(23, 59, 59, 999);
        return { start, end };
    };

    if (predefinedRange) {
      const range = calculatePredefinedRange(predefinedRange);
      if (range) {
        dateFilter = {
          'products.date': {
            $gte: range.start,
            $lte: range.end
          }
        };
      }
    } else if (startDate && endDate) {
        dateFilter = {
            'products.date': {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            }
        };
    } else if (startDate) {
        dateFilter = {
            'products.date': {
                $gte: new Date(startDate),
                $lt: new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 1))
            }
        };
    }

  
const orders = await Order.aggregate([
  { $unwind: "$products" },
  { $match: dateFilter },
  {
    $group: {
      _id: "$_id",
      userId: { $first: "$userId" },
      products: { $push: "$products" },
      totalPrice: { $first: "$totalPrice" },
      address: { $first: "$address" },
      Wallet: { $first: "$Wallet" },
      createdAt: { $first: "$createdAt" },
      updatedAt: { $first: "$updatedAt" }
    }
  },
  {
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'userDetails'
    }
  },
  { $unwind: "$userDetails" },
    { $skip: skip },
    { $limit: limit }
])  
console.log("orders",orders);


const totalOrders = await Order.countDocuments(dateFilter);
console.log("total order",totalOrders);
// const totalPages = Math.ceil(totalOrders / limit);
const totalPages = totalOrders > 0 ? Math.ceil(totalOrders / limit) : 0;  // Handle empty results
console.log("total pages ",totalPages);


if (!orders || orders.length === 0) {
  res.render('admin/dashboard', {
    order: [],
    totalProductsCount,
    totalRevenue: 0, // Set to 0 if no orders found
    pasttotalRevenue,
    uniqueProductCount,
    message: 'No orders found for the selected date range',
    currentPage: page,
    totalPages: totalPages,
    limit: limit
  });

    } else {
        const categoryOrders = await Order.aggregate([
            { $unwind: '$products' },
            {
                $group: {
                    _id: '$products.productId',
                    productCount: { $sum: '$products.quantity' },
                },
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },
            {
                $group: {
                    _id: '$productDetails.category',
                    productCount: { $sum: '$productCount' }
                }
            }
        ]);

        res.render('admin/dashboard', {
            order: orders,
            totalProductsCount,
            totalRevenue,
            pasttotalRevenue,
            uniqueProductCount,
            categoryOrders,
            currentPage: page,
            totalPages: totalPages,
            limit: limit
        });
    }







 
// // Flatten the products array from all orders
// let products = [];
// order.forEach(order => {
//     products = products.concat(order.products);
// });

  // if (!order || order.length === 0) {
  //     return res.status(404).send('Orders not found');
  // }
  
  // // Initialize an empty array to store paginated products
  // let products = [];
  
  // // Paginate the products array for each order document
  // order.forEach(order => {
  //     const paginatedProducts = order.products.slice((page - 1) * limit, page * limit);
  //     products = products.concat(paginatedProducts);
  // });
  
  // // Calculate total number of products across all orders
  // const totalProductsCounts = order.reduce((total, order) => total + order.products.length, 0);
  
  // // Calculate total number of pages
  // const totalPages = Math.ceil(totalProductsCounts / limit);
  
  




    // res.render("admin/dashboard",{
    //   totalProductsCount,
    //   totalRevenue,
    //   pasttotalRevenue,
    //   uniqueProductCount,
    //     order,
    //     // products
    //     // products, // List of paginated products
    //     // totalPages, // Total number of pages
    //     // currentPage: page, // Current page
    //     // nextPage: page < totalPages ? page + 1 : null, // Next page
    //     // previousPage: page > 1 ? page - 1 : null, // Previous page 
    // });

  
  
    console.log("dashbord rendering");
  } catch (error) {
    console.log("admin controll LoadDashboard error", error);
  }
};


const getDashboardData = async (req, res) => {
  try {
      // Get start of the week and start of the year dates
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const startOfYear = new Date(new Date().getFullYear(), 0, 1);

      // Fetch orders for the current week
      const weeklyOrders = await Order.aggregate([
          { $match: { createdAt: { $gte: startOfWeek } } },
          {
              $group: {
                  _id: { $dayOfWeek: "$createdAt" },
                  count: { $sum: 1 }
              }
          }
      ]);

      const dataCurrentWeek = {};
      for (let i = 1; i <= 7; i++) {
          dataCurrentWeek[i] = 0; // Initialize all days to 0
      }
      weeklyOrders.forEach(order => {
          dataCurrentWeek[order._id] = order.count;
      });

      // Fetch orders for the current year
      const yearlyOrders = await Order.aggregate([
          { $match: { createdAt: { $gte: startOfYear } } },
          {
              $group: {
                  _id: { $month: "$createdAt" },
                  count: { $sum: 1 }
              }
          }
      ]);

      const dataCurrentYear = {};
      for (let i = 1; i <= 12; i++) {
          dataCurrentYear[i] = 0; // Initialize all months to 0
      }
      yearlyOrders.forEach(order => {
          dataCurrentYear[order._id] = order.count;
      });

      // Fetch revenue for the current year
      const yearlyRevenue = await Order.aggregate([
          { $match: { createdAt: { $gte: startOfYear } } },
          {
              $group: {
                  _id: { $month: "$createdAt" },
                  revenue: { $sum: "$totalPrice" }
              }
          }
      ]);

      const revenueCurrentYear = {};
      for (let i = 1; i <= 12; i++) {
          revenueCurrentYear[i] = 0; // Initialize all months to 0
      }
      yearlyRevenue.forEach(revenue => {
          revenueCurrentYear[revenue._id] = revenue.revenue;
      });

      res.json({
          dataCurrentWeek,
          dataCurrentYear,
          revenueCurrentYear
      });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};




//  logout function

const logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log("error from admin logout", err);
        res.status(500).send("server error");
      } else {
        console.log("logout working");
        res.redirect("/admin");
      }
    });
  } catch (error) {
    console.log("error from admin controll logout", error);
  }
};

// renderin users list in admin panel fn

const loadUsersList = async (req, res) => {
  try {
    // const id= req.query.id
    //  var searchQuery= req.query.search // Extract the search query from the request query parameters
    // let users;
    // console.log("name",searchQuery);
    // if(searchQuery)
    // {

    //   users = await User.find({ username: { $regex: `^${searchQuery}`, $options: 'i' } , isAdmin:0}); // Example: searching by name
    // console.log(users);

    // }

    // else
    // {
    //   users = await User.find({ isAdmin: 0 }); // Example: retrieving all users

    // }

    var search = "";

    if (req.query.search) {
      search = req.query.search;
    }

    var page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    const limit = 2;

    const users = await User.find({
      isAdmin: 0,
      $or: [{ username: { $regex: search, $options: "i" } }],
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await User.find({
      isAdmin: 0,
      $or: [{ username: { $regex: search, $options: "i" } }],
    }).countDocuments();

    console.log(users);

    res.render("admin/userslist", {
      users,
      totalpage: Math.ceil(count / limit),
      currentpage: page,
    });

    console.log(User.length);
  } catch (error) {
    console.log("error from admin controller loadUsersList", error);
  }
};

const LoaduserProfile = async (req, res) => {
  try {
    const userId = req.query.id;
    const user = await User.findById(userId).exec();
    if (!user) {
      res.status(404).send("User not found");
    } else {
      console.log(user.username);
      res.render("admin/userprofile", { users: user });
    }
    // }
    // catch (err) {
    //     console.error('Error:', err);
    //     res.status(500).send('Error retrieving user details');
    // }

    //    })

    console.log("LoaduserProfile renderd");
  } catch (error) {
    console.log("error from usercontroller Loaduser profile", error);
  }
};

const BlockUser = async (req, res) => {
  try {
    console.log("block user start");
    const id = req.query.id;

    const userData = await User.findByIdAndUpdate(id, {
      $set: { isBlocked: true },
    });
    console.log("blocked");

    if (userData) {
      console.log("userDaata finded");
      console.log("session user ", req.session.user);
      if(req.session.user)
        {
          req.session.user.isBlocked = true;

        }else

        {
          console.log("no session");
        }
      
      
    }else
    {
      console.log("userData is not ");
    }
    res.redirect("/admin/users");

    console.log("block user lastr");
  } catch (error) {
    console.log("error from admin Controll block", error);
  }
};

const unBlockUser = async (req, res) => {
  try {
    const id = req.query.id;

    const userData = await User.findByIdAndUpdate(id, {
      $set: { isBlocked: false },
    });
    if (userData) res.redirect("/admin/users");
  } catch (error) {
    console.log("error from admin controller unblovk user", error);
  }
};

const loadOrderList = async (req, res) => {
  try {
    // Fetch orders without populating userId and products.productId
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const productPage = parseInt(req.query.productPage) || 1;
    const productLimit = parseInt(req.query.productLimit) || 3;

    const startIndex = (page - 1) * limit;
    const productStartIndex = (productPage - 1) * productLimit;
    // var page = 1;
    // if (req.query.page) {
    //   page = req.query.page;
    // }
    // const limit = 4;

    const orderData = await Order.find()
    
    .skip(startIndex)
    .limit(limit)
    .populate('userId')
    .populate('products.productId');
    
    // // Now orderData contains populated products
    // console.log("orderData from Admin", orderData);

    //   const totalOrders = await Order.countDocuments();;

    //   const paginatedOrders = orderData.map(order => {
    //     const paginatedProducts = order.products.slice(productStartIndex, productStartIndex + productLimit);
    //     return {
    //         ...order.toObject(),
    //         products: paginatedProducts
    //     };
    // });
    
    // // Now orderData contains populated products
    // console.log("paginatedorders", paginatedOrders);
    // console.log("paginated products", paginatedProducts);


    // Render or send the orderData as needed
    res.render("admin/orderlist", {
      orderData: orderData,
      // orderData: paginatedOrders,
      // currentPage: page,
      // totalPages: Math.ceil(totalOrders / limit),
      // productPage,
      // productLimit,
      // orderLimit: limit
    });

    //   if (!orderData || !orderData.order || !Array.isArray(orderData.order)) {
    //     console.error("Order data is invalid or missing.");
    //     return;
    // }

    // orderData.order.forEach(order => {
    //     if (!order.products || !Array.isArray(order.products)) {
    //         console.error("Products data in order is invalid or missing.");
    //         return;
    //     }

    //     order.products.forEach(product => {
    //         console.log("Product ID: ", product.productId);
    //         console.log("Product Name: ", product.name);
    //         console.log("Product Price: ", product.price);
    //         // Add more properties as needed
    //     });
    // });

    // res.render('admin/orderlist',{orderData})
  } catch (error) {
    console.log("error from  admin controller loadOrderList", error);
  }
};

const StatusChanging = async (req, res) => {
  try {
    console.log("status changingn   ....");

    const { productId, orderId, status } = req.body;
    console.log("product Id ", productId);
    console.log("orderId Id ", orderId);
    console.log("status ", status);

    const orderData = await Order.findOne({ _id: orderId })
      .populate("userId")
      .populate("products.productId");

    if (!orderData) {
      console.log("Error finding order data");
      return res
        .status(400)
        .json({ success: false, message: "Something wrong, try again later" });
    }

    const orderDetails = orderData.products.find(
      (pro) => pro._id.toString() === productId
    );

    if (!orderDetails) {
      console.log("Error finding order details");
      return res
        .status(400)
        .json({ success: false, message: "Something wrong, try again later" });
    } else {
      if (status == "cancelled") {
        const size = orderDetails.size;
        const quantity = orderDetails.quantity;
        const productIdd = orderDetails.productId;

        if (!productIdd) {
          console.log("Product not found");
          return res.status(400).json({
            success: false,
            error: "Something wrong cancelling order",
          });
        }

        const updateObject = {};
        updateObject[`stock.${size.toUpperCase()}`] = quantity; // Increment the stock of the corresponding size by the cancelled quantity

        const productData = await Product.findByIdAndUpdate(
          productIdd,
          { $inc: updateObject },
          { new: true }
        );

        if (!productData) {
          console.log("Error updating product data");
          return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
        }

        console.log("Product updated", productData);

        const productIndex = orderData.products.findIndex(
          (pro) => pro._id.toString() === productId
        );

        if (productIndex !== -1) {
          // Product found, update its status
          orderData.products[productIndex].product_orderStatus = "cancelled";
        } else {
          console.log("Product not found in the order.");
        }

        await orderData.save();

        res.status(200).json({ success: true, message: "  Order Cancelled" });
      }

      if (status == "pending" || "completed") {
        const productIndex = orderData.products.findIndex(
          (pro) => pro._id.toString() === productId
        );

        if (
          orderData.products[productIndex].product_orderStatus === "cancelled"
        ) {
          res.status(400).json({
            success: false,
            message: "sorry your order Already cancelled ",
          });
        } else if (
          orderData.products[productIndex].product_orderStatus === "pending"
        ) {
          orderData.products[productIndex].product_orderStatus = status;
          await orderData.save();
          res.status(200).json({ success: true, message: `Oder ${status}...` });
        } else if (
          orderData.products[productIndex].product_orderStatus === "completed"
        ) {
          orderData.products[productIndex].product_orderStatus = status;
          await orderData.save();
         
          res.status(200).json({ success: true, message: `Order ${status}...` });
        } else {
          res.status(200).json({ success: false, message: "somthing wrong.." });
        }
      }    
    }
  } catch (error) {
    console.log("error from admin conmtroller StatusChanging", error);
  } 
}; 



const 
pdfDownlodedOrders=async(req,res)=>{
  try {


   const { startDate, endDate, predefinedRange } = req.query;
   console.log("Received query parameters:", req.query);  // Debugging log
   let dateFilter = {};
   
   const calculatePredefinedRange = (range) => {
       console.log("Calculating predefined range for:", range);  // Debugging log
       const now = new Date();
       let start = new Date();  // Initialize start date as the current date
   
       switch (range) {
           case 'oneDay':
               start = new Date(now.setDate(now.getDate() - 1));
               break;
           case 'oneWeek':
               start = new Date(now.setDate(now.getDate() - 7));
               break;
           case 'oneMonth':
               start = new Date(now.setMonth(now.getMonth() - 1));
               break;
           case 'oneYear':
               start = new Date(now.setFullYear(now.getFullYear() - 1));
               break;
           default:
               console.log("Invalid predefined range:", range);  // Debugging log
               return null;
       }
   
       // Reset the start date to the beginning of the day
       start.setHours(0, 0, 0, 0);
   
       // Set the end date to the end of the current day
       const end = new Date();
       end.setHours(23, 59, 59, 999);
   
       console.log(`Range: ${range}, Start: ${start}, End: ${end}`);  // Debugging log
       return { start, end };
   };
   
   if (predefinedRange) {
       console.log("Predefined range provided:", predefinedRange);  // Debugging log
       const range = calculatePredefinedRange(predefinedRange);
       if (range) {
           dateFilter = {
               'products.date': {
                   $gte: range.start,
                   $lte: range.end
               }
           };
       }
   } else if (startDate && endDate) {
       dateFilter = {
           'products.date': {
               $gte: new Date(startDate),
               $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
           }
       };
   } else if (startDate) {
       dateFilter = {
           'products.date': {
               $gte: new Date(startDate),
               $lt: new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 1))
           }
       };
   }
   
   console.log("Date Filter:", dateFilter);  // Debugging log
   
   const orders = await Order.aggregate([
       { $unwind: "$products" },
       { $match: dateFilter },
       {
           $lookup: {
               from: 'products',
               localField: 'products.productId',
               foreignField: '_id',
               as: 'productDetails'
           }
       },
       { $unwind: "$productDetails" },
       {
           $addFields: {
               "products.formattedDate": {
                   $function: {
                       body: `function(date) { 
                           const options = { weekday: 'short', year: '2-digit', month: 'short', day: 'numeric' }; 
                           return new Date(date).toLocaleDateString('en-US', options); 
                       }`,
                       args: ["$products.date"],
                       lang: "js"
                   }
               }
           }
       },
       {
           $group: {
               _id: "$_id",
               userId: { $first: "$userId" },
               products: {
                   $push: {
                       productName: "$productDetails.name",
                       productPrice: "$products.productPrice",
                       promo_price: "$productDetails.promo_price",
                       quantity: "$products.quantity",
                       product_orderStatus: "$products.product_orderStatus",
                       payment_status: "$products.payment_status",
                       payment_method: "$products.payment_method.method",
                       date: "$products.formattedDate"
                   }
               },
               totalPrice: { $first: "$totalPrice" },
               address: { $first: "$address" },
               Wallet: { $first: "$Wallet" },
               createdAt: { $first: "$createdAt" },
               updatedAt: { $first: "$updatedAt" }
           }
       },
       {
           $lookup: {
               from: 'users',
               localField: 'userId',
               foreignField: '_id',
               as: 'userDetails'
           }
       },
       { $unwind: "$userDetails" }
   ]);
   
  
    if (!orders || orders.length === 0) {
        return res.status(404).send('No orders found for the selected date range');
    }



    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    let filename = `orders_report_${new Date().toISOString()}.pdf`;
    filename = encodeURIComponent(filename);

    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

    doc.on('data', (chunk) => res.write(chunk));
    doc.on('end', () => res.end());


// Header
doc.fontSize(25).text('Order Report', { align: 'center' }).moveDown(2);

// Table header
doc.fontSize(12).font('Helvetica-Bold').fill('#333');
const headers = ['date','User', 'Product Name', 'Product Price', 'Discount', 'Quantity', 'Total', 'Status'];
const headerXPositions = [10,60, 130, 230, 320, 390, 460, 530];
const headerYPosition = 150;
const rowHeight = 30; // Increased row height for better readability

// Draw table header borders
headers.forEach((header, i) => {
    doc.text(header, headerXPositions[i], headerYPosition);
});
doc.moveTo(10, headerYPosition + rowHeight).lineTo(570, headerYPosition + rowHeight).stroke();
doc.moveTo(10, headerYPosition - 10).lineTo(570, headerYPosition - 10).stroke();

// Draw vertical lines for header columns
headerXPositions.forEach((xPos) => {
    doc.moveTo(xPos, headerYPosition - 10).lineTo(xPos, headerYPosition + rowHeight).stroke();
});
doc.moveTo(570, headerYPosition - 10).lineTo(570, headerYPosition + rowHeight).stroke();

// Iterate through orders and products
let y = headerYPosition + rowHeight + 0; // Initial y position with extra padding

orders.forEach(order => {
    order.products.forEach(product => {
      const productPriceee=parseFloat(product.promo_price*product.quantity)
        const discount = parseFloat(productPriceee - product.productPrice);
        const total = product.promo_price * product.quantity;

        // Check for missing data
        if (!product.productName || !product.promo_price || !product.quantity) return;

        // Draw row borders
        doc.moveTo(10, y).lineTo(570, y).stroke();
        doc.moveTo(10, y + rowHeight).lineTo(570, y + rowHeight).stroke();
        headerXPositions.forEach((xPos) => {
            doc.moveTo(xPos, y).lineTo(xPos, y + rowHeight).stroke();
        });
        doc.moveTo(570, y).lineTo(570, y + rowHeight).stroke();

        // Add product details
        doc.fontSize(9).font('Helvetica').fill('#555');
        doc.fontSize(8).text(product.date,10,y+0,{width:50,align:'center'})
        doc.text(order.userDetails.username, 60, y + 10, { width: 70, align: 'center' });
        doc.text(product.productName, 130, y + 10, { width: 100, align: 'left' });
        doc.text(product.promo_price.toFixed(0), 230, y + 10, { width: 70, align: 'center' }); // Fixed decimal places
        doc.text(discount.toFixed(0), 320, y + 10, { width: 60, align: 'center' }); // Fixed decimal places
        doc.text(product.quantity.toString(), 390, y + 10, { width: 60, align: 'center' });
        doc.text(total.toFixed(0), 460, y + 10, { width: 70, align: 'center' }); // Fixed decimal places
        doc.text(product.product_orderStatus, 530, y + 10, { width: 50, align: 'left' });

        y += rowHeight; // Move to the next line

        if (y > 750) { // Create a new page if the content exceeds the page height
            doc.addPage();
            y = 50; // Reset y position for new page

            // Re-add table header on new page
            headers.forEach((header, i) => {
                doc.text(header, headerXPositions[i], 20);
            });
            doc.moveTo(50, 40).lineTo(550, 40).stroke();

            // Draw vertical lines for header columns on new page
            headerXPositions.forEach((xPos) => {
                doc.moveTo(xPos, 10).lineTo(xPos, 40).stroke();
            });
            doc.moveTo(550, 10).lineTo(550, 40).stroke();

            y = 60;
        }
    });


    y += rowHeight; // Add extra space between different orders
});

doc.end();


  } catch (error) {
    
    console.log("error from admin controller pdfDownlodedOrders",error);
  }
}
 



const loadOrderDetials=async(req,res)=>{
  try {
    const orderId=req.query.id
    console.log("orderId",orderId);
    let address;
    const orderData=await Order.find().populate('products.productId').populate('products.coupon').exec();
    console.log("address",orderData.address);
    
if (orderData.length > 0) {
  console.log("address", orderData[0].address); // Check the address of the first order
  address= orderData[0].address
} else {
  console.log("No orders found");
}
    if(orderData)
      {
        console.log("orderData finded");
        const orderIdd=orderData._id
                console.log("order",orderIdd);

        if (orderData && Array.isArray(orderData)) {
          for (const order of orderData) {
              if (Array.isArray(order.products)) {
                  const orderDetails = order.products.find(pro => pro._id.toString() === orderId);
        // const orderDetails= await orderData.products.find(pro=>pro._id.toString()===orderId)
        if(orderDetails)
          {
            console.log("finded orderDetails");
            res.render('admin/orderDetail',{order:orderDetails,userOrder: orderData.length > 0 ? orderData[0].address : null,
              orderIdd: orderData.length > 0 ? orderData[0]._id : null})
          }else
          {
            console.log("not finded orderDetails");
          }
        }
      }
    }
      }
      else
      {
        console.log("not finded orderData");
      }
    
  } catch (error) {
    
    console.log("error from admin controller loadOrderDetials",error );
  }
}

const orderDetailsUpdateStatus=async(req,res)=>{
   try {
    console.log("orderDetailsUpdateStatus");
    const {orderId}=req.params
    const {status,orderIdd}=req.body
    const orderData=await Order.findById(orderIdd).populate('products.productId').populate('products.coupon');
    if(orderData)
      {
        console.log("findeddd orderData");
        
        const orderDetails=await orderData.products.find(pro=>pro._id.toString()===orderId)
        if(orderDetails)
          {
            console.log("findeddd orderDetails");
            if(orderDetails.product_orderStatus==="cancelled")
            {
              res.status(200).json({success:false,message:'Order Already Cancelled'})

              return
            }
              orderDetails.product_orderStatus=status
              await orderData.save()      
              res.status(200).json({success:true})  

            
           
        

        }
      }
    


   } catch (error) {
    
    console.log("error from admin controller orderDetailsUpdateStatus",error);
   }
}




const getStartDate=require('../helpers/chartFilter')

const getOrdersGraphData = async (req, res) => {
  try {
    const interval = req.query.interval || 'monthly';
    const startDate = getStartDate(interval);

   
    let groupId;
    let dateFormat;

    switch (interval) {
        case 'yearly':
            groupId = { year: { $year: '$products.date' } };
            dateFormat = { $concat: [{ $toString: "$_id.year" }] };
            break;
        case 'monthly':
            groupId = { month: { $month: '$products.date' }, year: { $year: '$products.date' } };
            dateFormat = {
                $concat: [
                    { $toString: "$_id.month" },
                    "/",
                    { $toString: "$_id.year" }
                ]
            };
            break;
        case 'weekly':
        default:
            groupId = { day: { $dayOfMonth: '$products.date' }, month: { $month: '$products.date' }, year: { $year: '$products.date' } };
            dateFormat = {
                $concat: [
                    { $toString: "$_id.day" },
                    "/",
                    { $toString: "$_id.month" },
                    "/",
                    { $toString: "$_id.year" }
                ]
            };
            break;
    }

    console.log("group id", groupId);
    console.log("date format", dateFormat);

    
        const orders = await Order.aggregate([
            { $unwind: "$products" },
            { $match: { "products.date": { $gte: startDate } } },
            {
                $group: {
                    _id: groupId,
                    totalOrders: { $sum: 1 }
                }
            },
            {
                $addFields: {
                    date: dateFormat
                }
            },
            {
                $project: {
                    _id: 0,
                    date: 1,
                    totalOrders: 1
                }
            },
            { $sort: { 'date': 1 } }
        ]);

        const labels = orders.map(order => order.date);
        const values = orders.map(order => order.totalOrders);

        console.log("labels: ", labels);  // Debugging log
        console.log("values: ", values);  // Debugging log


        
   res.json({ labels, values });
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
};





const loadStatics=async(req,res)=>{
  try {


    const bestProduct = await Order.aggregate([
      { $unwind: '$products' },
      { 
          $group: {
              _id: '$products.productId',
              totalQuantity: { $sum: '$products.quantity' },
              totalSales: { $sum: { $multiply: ['$products.quantity', '$products.productPrice'] } }
          }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
          $lookup: {
              from: 'products',
              localField: '_id',
              foreignField: '_id',
              as: 'productDetails'
          }
      },
      { $unwind: '$productDetails' },
      {
          $project: {
              _id: 1,
              totalQuantity: 1,
              totalSales: 1,
              'productDetails.name': 1,
              'productDetails.price': 1,
              'productDetails.image': 1
          }
      }
  ]);
  // console.log("orders",orders);



  const bestCategory = await Order.aggregate([
    { $unwind: '$products' },
    {
        $lookup: {
            from: 'products',
            localField: 'products.productId',
            foreignField: '_id',
            as: 'productDetails'
        }
    },
    { $unwind: '$productDetails' },
    {
        $group: {
            _id: '$productDetails.category',
            totalQuantity: { $sum: '$products.quantity' },
            totalSales: { $sum: { $multiply: ['$products.quantity', '$products.productPrice'] } }
        }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 10 },
    {
        $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'categoryDetails'
        }
    },
    { $unwind: '$categoryDetails' },
    {
        $project: {
            _id: 1,
            totalQuantity: 1,
            totalSales: 1,
            'categoryDetails.name': 1,
            'categoryDetails.description': 1
        }
    }
]);
console.log("best produvt ",bestProduct);
console.log("best category ",bestCategory);

// res.status(200).json(orders);


    res.render('admin/statics',{product:bestProduct,category:bestCategory})
    
  } catch (error) {
    
    console.log("error form admincontroller loadStatics",error);
  }
}

module.exports = { 
  login,
  veryfyLogin, 
  loadDashboard,
  pdfDownlodedOrders,
  // getDashboardData,

  loadUsersList,
  LoaduserProfile, 
  logout,
  BlockUser,
  unBlockUser,

  loadOrderList,
  StatusChanging,
  loadOrderDetials,
  orderDetailsUpdateStatus,
  getOrdersGraphData,
  loadStatics


  
};
