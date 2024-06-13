const express=require('express')
const app= express()
const passport=require("passport")
const session=require('express-session')
const bodyparser=require('body-parser')
const path=require('path')
require('dotenv').config()
const cors=require('cors')


// const cookie_Parser=require('cookie-parser')


const port=process.env.PORT||3000
const mongoose=require('mongoose')

// app.use(cookie_Parser())
app.use(session({ 
    secret:process.env.Secret,
    resave:false,
    saveUninitialized:true
}))


app.use(passport.initialize())
app.use(passport.session())


mongoose.connect(process.env.MongoDb) 
.then(async () => {
    console.log('mongodb connected');
    // Insert some data into a collection
    await mongoose.connection.db.collection('test').insertOne(  { name: 'test' });
})
.catch((err) => console.log(err)); 

   



// // Serialize and deserialize user
// passport.serializeUser(function(user, done) {
//     done(null, user.id);
// });

// passport.deserializeUser(function(id, done) {
//     User.findById(id, function(err, user) {
//         done(err, user);
//     });
// });





const adminRoute=require('./routes/adminRoute')
const userRoute=require('./routes/usersRoute')
const cookieParser = require('cookie-parser')

// view engine setting

app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')











// bodyparser using
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))
app.use(cors())


// setting public 
app.use(express.static('public'));

app.use(express.static(path.join(__dirname,'public')))



app.use('/admin',adminRoute)
app.use('/',userRoute)






app.listen(port,()=>console.log(`server runnning ${port}`))






