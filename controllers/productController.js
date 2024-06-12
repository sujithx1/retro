const category=require('../models/categoryModel')
const procduct=require('../models/productModel')
const fs = require('fs');
const path = require('path');



// loading product function

const loadProductlist=async(req,res)=>{
    try {
      // const searchQuery= req.query.search

      // console.log("search",searchQuery);

      // let products

      // if(searchQuery)
      // {

      //   products= await procduct.find({name:{$regex:searchQuery, $options:"i"}}).populate('category')

      //   console.log(products);
      // }else

      // {
      //   products=await procduct.find({}).populate('category')

      // }
      console.log("load productlist");
      var search=""
      if(req.query.search)
      {
        search=req.query.search
        console.log("quary search = ",req.query.search);
        console.log("search= ",search);

      }

      var page=1

      if(req.query.page)
      {
        page=req.query.page
      }

      const limit=3



      const products=await procduct.find({$or:[
       { name:{$regex:search,$options:"i"}}
      ]}).populate('category').limit(limit*1).skip((page-1)*limit).exec()   

      const count=await procduct.find({$or:[
       { name:{$regex:search,$options:"i"}}
      ]}).populate('category').countDocuments();

 
     
  
        res.render('admin/productlist',{products,
          totalpage:Math.ceil(count/limit),
          // currnet page ariyan
          currentpage:page,
          // next pagilott poovan
          nextpage:page+1,
        })

        
    } catch (error) {
        
        console.log('error from product controller load product list',error);
    }
}



// load   ing product function
const loadaddProduct = async (req, res) => {
    try {
     
     
      const categoryData= await category.find({})
      res.render("admin/addproduct",{msg:categoryData});

      


      console.log("load add product rendering");
    } catch (error) {
      console.error("Error procduct  controller load add product:", error);
      res.status(500).send("Internal Server Error");
    }
  };





  //  add product function
  const addProduct=async(req,res)=>{



    try {
      // requiring all product
      const P_name=req.body.product_name;
      const p_description=req.body.product_description
      const p_Aprice=req.body.product_Aprice
      const p_Pprice=req.body.product_Pprice
      const P_category=req.body.product_category
      console.log(P_category);

      // const products= await procduct.find({})
      const uniqCategory=await procduct.findOne({name:{$regex:P_name,$options:"i"}})
      if(uniqCategory)
      {
          res.render('admin/addproduct',{message:"already product  added",msg:""})
      }else
      {
      // images file collect  cheyth array ayi upload cheyunnu
      const p_images=req.files.map(file => file.filename)

      console.log("images ",p_images); 
      console.log(req.files);
 
       // Create stock object based on request body
      //   stock 0 ayaalum koxhappulla so 
    const stock = req.body.stock || {}; // Use empty object if stock data is undefined

      
    console.log(stock);
    // Destructure stock object with default values
    const { XS = 0, S = 0, M = 0, L = 0, XL = 0, XXL = 0 } = stock;

    
      // const XS=req.body.stock.XS
      // const S=req.body.stock.S
      // const M=req.body.stock.M
      // const L=req.body.stock.L
      // const XL=req.body.stock.XL
      // const XXL=req.body.stock.XXL

      
      // category find cheyunnu 
         const findCategory= await category.findOne({_id:P_category})
         if(findCategory)
         {
           
           console.log('finded category');
           console.log('finded category',findCategory.name);
         }else
         {
          console.log('category id is not is ');
         }
        //  create adding new document in mongo db 
      const productAdding= await procduct.create({

        name:P_name,
        description:p_description,
        image:p_images,
        price:p_Aprice,
        promo_price:p_Pprice,
        stock: { XS, S, M, L, XL, XXL },
        category:findCategory._id,
        delete:false

        

      })
      //  saving document in db
      const product= await productAdding.save()
      if(product)
      {
        console.log('prodect added');
        res.redirect('/admin/product')
      }else

      {     
        res.render('admin/addproduct',{msg:'Error adding product'})
      }

    }

      
    } catch (error) {
      console.log('error  from product controll add product ',error);
    }
  }



  //  loading edit product function
  const loadEditproduct=async(req,res)=>{
    try {
      // category find cheyyunn category list
      const categoryData= await category.find({})
    
      // edit kodukkunna product nte _id pass cheyyunnu and
            const id=req.query.id
      const product= await procduct.findOne({_id:id})
      
      res.render('admin/editproduct',{data:product,cat:categoryData})
      
    } catch (error) {
      
      console.log('error from product controle loadEditproduct',error);
    }
  }






  // edit function
  const editProduct=async(req,res)=>{
    //  same as add product fn
    try {
      const id=req.query.id
      const P_name=req.body.product_name;
      const p_description=req.body.product_description
      const p_Aprice=req.body.product_Aprice
      const p_Pprice=req.body.product_Pprice
      const P_category=req.body.product_category
      console.log(P_category);
          // Create stock object based on request body
    const stock = req.body.stock || {}; // Use empty object if stock data is undefined

  
  

    console.log(stock);
    // Destructure stock object with default values
    const { XS = 0, S = 0, M = 0, L = 0, XL = 0, XXL = 0 } = stock;


      const findCategory= await category.findOne({_id:P_category})
      if(findCategory)
      {
        
        console.log('finded category');
        console.log('finded category',findCategory.name);
      }else
      {
       console.log('category id is not is ');
      }
    
      // const product = await procduct.findById(id);
      // if (!product) {
      //   return res.status(404).json({ error: 'Product not found' });
      // }
  
         // images file collect  cheyth array ayi upload cheyunnu
    
   

      // const p_images = req.files ? req.files.map(file => file.filename) : []; 
      // console.log("images ",p_images);

// Fetch the product from the database
const product = await procduct.findById(id);

if (!product) {
    return res.status(404).json({ error: 'Product not found' });
}

// // Ensure product.image is an array
// if (!Array.isArray(product.image)) {
//     product.image = [];
// }

// // Handle the new images
// for (let i = 0; i < p_images.length; i++) {
//     // Replace the old image at the same index with the new image
//     if (5 <= product.image.length) {
//         product.image[i] = p_images[i];
//         console.log("image ",product.image[i]);
//     } else {
//         // Add new image if index exceeds current array length
//         product.image.push(p_images[i]);
//     }
// }

console.log("Uploaded Files: ", req.files); // Check if files are received correctly
     // Handle image updates
     const images = req.files.map(file => file.filename); // Get the filenames of uploaded images
     console.log("images ",images);
     
     if(images.length > 0) {
      product.image = [...product.image, ...images];
      // await product.save();
  }else
  {
    console.log("no product saved");
  }
    //  product.image = [...product.image, ...images]; // Append new images to existing images

       // Update other product details
       product.name = P_name;
       product.description = p_description;
       product.price = p_Aprice;
       product.promo_price = p_Pprice;
       product.category = P_category;
        // product.image=p_images,



        //  // Update stock information
        //  const stock = req.body.stock || {};
        //  const { XS = 0, S = 0, M = 0, L = 0, XL = 0, XXL = 0 } = stock;
         product.stock = { XS, S, M, L, XL, XXL };  
         await product.save()
         console.log("product Updated");
         res.redirect('/admin/product')
 
          // // Update product details
    // product.name = P_name;
    // product.description = p_description;
    // product.Aprice = p_Aprice;
    // product.Pprice = p_Pprice;
    // product.category = P_category;
    // product.stock = { XS, S, M, L, XL, XXL };

    // Save the updated product
    // const updatedProduct = await product.save();

      //  updateing 


      // const edit= await procduct.findByIdAndUpdate(id,{


      //   name:P_name,
      //   description:p_description,
      //   // image:p_images,
      //   price:p_Aprice,
      //   promo_price:p_Pprice,
      //   stock: { XS, S, M, L, XL, XXL },
      //   category:findCategory._id,
      //   delete:false

      // },{new:true})
     

      // if(edit)
      // {
      //   console.log('edited');
      //   await product.save()
      //   res.redirect('/admin/product')
      // }else{
      //   console.log('edit not completed');
      // }



      
    } catch (error) {
      
      console.log('error from product controler editProduct',error);
    }
  }

// soft  delete product 
  const deleteProduct= async(req,res)=>{
    try {
      const id=req.query.id
      //  soft delete process
      const deleteP= await procduct.findByIdAndUpdate(id,{
        delete:true
      })
      if(deleteP)
      {
        res.redirect('/admin/product')
      }
      else
      {
        res.render('admin/product')
        console.log('error delete product');
      }
      
    } catch (error) {
      
      console.log('errro from product controller deleteProduct',error);
    }
  }



  //  additional delete unblocked
  const unblockProduct= async(req,res)=>{
    try {
      const id=req.query.id
      const deleteP= await procduct.findByIdAndUpdate(id,{
        delete:false
      })
      if(deleteP)
      {
        res.redirect('/admin/product')
      }
      else
      {
        res.render('admin/product')
        console.log('error delete product');
      }

      
    } catch (error) {
      console.log('error from product controll unblockProduct',error);
    }
  }



  const productEditRemove =async(req,res)=>{

    try {
      const { productId, image } = req.body;
      console.log("body ",req.body);

      // Find the product by ID
      const product = await procduct.findById(productId);
      if (!product) {
          return res.status(404).json({ error: 'Product not found' });
      }

      // Check if the image exists in the product's image array
      const imageIndex = product.image.indexOf(image);
      if (imageIndex === -1) {
          return res.status(404).json({ error: 'Image not found in product' });
      }

      // Remove the image from the product's image array
      product.image.splice(imageIndex, 1); 
  
      // Delete the image file from the server
      const imagePath = path.join(__dirname, '../public/uploads', image);
      fs.unlink(imagePath, (err) => {
          if (err) {
              console.error('Error deleting the image file:', err);
              return res.status(500).json({ error: 'Error deleting the image file' });
          }

          // Save the updated product
         
          

        })
        const saving = await product.save()
        if(saving)
          res.status(200).json({success:true})
        else
        res.status(200).json({success:false})
              // Respond with a success message
       
    } catch (error) {
        console.error(' error  from  productController productEditRemove :', error);
        res.status(500).json({ error: 'An error occurred while removing the image' });
    }


  }



module.exports=
{
    loadProductlist,
    loadaddProduct,
    addProduct,
    loadEditproduct,
    editProduct,
    deleteProduct,
    unblockProduct,
    productEditRemove
    
}