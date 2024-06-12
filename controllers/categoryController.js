
const category=require('../models/categoryModel')



//  load category 
const loadCategory=async(req,res)=>{
    try {
        //  find mongo db all category


const searchQuery= req.query.search

let categoryData;
if(searchQuery)
{
    categoryData= await category.find({name:{$regex:searchQuery,$options:"i"}})

}
else
{

    categoryData=await category.find({})
}

        

        res.render('admin/category',{data:categoryData})
        
    } catch (error) {
        console.log('error from category controller load category',error);
    }
}

// addd category

const addCategory=async(req,res)=>{

    //  
    try {
        const categoryName=req.body.category_name
        const categorySlug=req.body.category_slug
        const catergoryAction=req.body.category_action
        const catergoryDescription=req.body.category_description

        const categoryData=await category.find({})
        // checking category in db
            const uniqCategory=await category.findOne({name:{$regex:categoryName,$options:"i"}})
            if(uniqCategory)
            {
                res.render('admin/category',{msg:"already category added",data:categoryData})
            }else
        {

        //  adding category 

        const categoryData=await category.create({
            name:categoryName,
            description:catergoryDescription,
            action:catergoryAction,
            slug:categorySlug,
            delete:false
        })

        const categoryInfo =await categoryData.save()
            if(categoryInfo)
            {
                res.redirect('/admin/category')
                console.log('saved category in mongo db');
            


       }else
       {
        res.render('admin/category',
    {data:'category created problem try again'})
       }
    }




        
    
} catch (error) {
        
        console.log('error from category controler add catergory',error);
    }
}

//  edit category loading 
const loadEditCategory=async(req,res)=>{
    try {
        
        //  choiced category edit passing _id
        const id=req.query.id
        const categoryData= await category.findOne({_id:id})
        console.log(categoryData);
        if(categoryData)
        {
            res.render('admin/editcategory',{edit:categoryData})

        }
        else
        {
            console.log(' not category ');
        }
        
    } catch (error) {
        console.log(('error from category conmtroll load edit user ',error));
    }
}
//  editing category 
const editCategory=async(req,res)=>{

    try {
   
        
        // collecting choiced category _id
        const id=req.query.id
       
        
        const categoryName=req.body.category_name
        const categorySlug=req.body.category_slug
        const catergoryAction=req.body.category_action
        const catergoryDescription=req.body.category_description

        // editing 


        const categoryData=await category.find({})
        // checking category in db
            const uniqCategory=await category.findOne({name:{$regex:categoryName,$options:"i"}})
            const target= await category.findOne({_id:id})
            if(uniqCategory._id.toString() != target._id.toString())
            {
                res.render('admin/category',{msg:"already category added",data:categoryData})
            }else
        { const categoryEdit=await category.findByIdAndUpdate(id,{
            name:categoryName,
            description:catergoryDescription,

            slug:categorySlug,
            action:catergoryAction
            

        },{new:true})
        
        if(categoryEdit)
        {
            res.redirect('/admin/category')
        }else
        {
            res.render('admin/editcategory',{msg:'error from editing '})
        }
    }
        // res.json(categoryEdit)
    } catch (error) {
        
        console.log('error from category controlle edit category',error);
    }
}

//  soft delete category
const deleteCategory=async(req,res)=>{
    try {

        const id=req.query.id
        const datadelete= await category.findByIdAndUpdate(id,{
            delete:true
        })
        if(datadelete)
        {
            res.redirect('/admin/category')

        }
        else
        {
            res.render('admin/category',{msg:'error from deleting User'})
        }
        
    } catch (error) {
        
        console.log('error from category contrll delete user',error);
    }
}

module.exports={    
    loadCategory,
    addCategory,
    editCategory,
    loadEditCategory,
    deleteCategory
}
