require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 4000 
const usermodel = require('./models/user')
const postmodel = require('./models/post')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require("jsonwebtoken")
const path = require('path')


//imPORT multer
const upload =require("./config/multer")



app.set('view engine', "ejs")
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public') ))
app.use(cookieParser())






app.get("/profile/upload", (req, res) => {
    // res.render('testlogin')
    console.log('working test  profileuploadprofileuploadprofileupload')
    res.render('profileupload')
})

app.post("/upload", isLoggedIn, upload.single('image') ,async (req, res) => {
 let findeduser=await usermodel.findOne({email:req.user.email})
findeduser.profilepic=req.file.filename;
await findeduser.save();
res.redirect('/profile') 
console.log(req.file)
})


//above multer prac on top
// ________________________________________________




app.get("/test", (req, res) => {
    res.render('testlogin')
    console.log('working test login')
    // res.send('working')
})


app.get("/", (req, res) => {
    res.render('home')
    console.log('working')
})

app.get("/login", (req, res) => {
    res.render('login')
})


app.post("/register", async (req, res) => {
    let { name, email, password, age, username } = req.body

    let user = await usermodel.findOne({ email });
    if (user) return res.send('already user hai email se')

    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {

            let newuser = await usermodel.create({
                name,
                email,
                password: hash,
                age,
                username

            })
            //user ko login karwana  hai
            //this data are  we saving on  email user id
            let token = jwt.sign({ email: email, userid: newuser._id }, "shhhh")
            res.cookie("token", token)

            res.redirect("/profile")
        });
    });

})

app.post("/login", async (req, res) => {
    let { email, password } = req.body

    //user check karna  
    let user = await usermodel.findOne({ email });
    //if user nahi to bolna user nahi hai
    if (!user) return res.send(' user nahi hai somethin went wrong')

    bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
            
            let token = jwt.sign({ email: email, userid: user.id }, 'shhhh')
            res.cookie('token', token)

            res.status(200).redirect('/profile')

        }
        else res.redirect('/login')
    })
})









app.get("/logout", (req, res) => {
    res.cookie("token", "")
    res.redirect('/login')
})


app.get("/profile", isLoggedIn, async (req, res) => {

    let user = await usermodel.findOne({email: req.user.email}).populate("posts")
    // req.user.email==>//profile pe kiska hai wo pata chalega
    res.render('profile',{user})
})


app.get("/like/:id", isLoggedIn, async (req, res) => {

    let post = await postmodel.findOne({_id: req.params.id}).populate("user")
  if (post.likes.indexOf(req.user.userid) === -1){
      
      post.likes.push(req.user.userid)
  }
  else{
    
    post.likes.splice(post.likes.indexOf(req.user.userid),1)
}
   await  post.save()
   res.redirect("/profile")
   
    
})


app.get("/edit/:id", isLoggedIn, async (req, res) => {

    let post = await postmodel.findOne({_id: req.params.id}).populate("user")
    console.log(post)
res.render('edit',{post})
   
    
})


app.post("/update/:id", isLoggedIn, async (req, res) => {
    let post = await postmodel.findOneAndUpdate({_id: req.params.id},{content:req.body.content})
res.redirect('/profile')
    
})

app.post("/post", isLoggedIn, async (req, res) => {
    let {content}=req.body;
    let user=await usermodel.findOne({email:req.user.email})
    
let post = await postmodel.create(
    {user:user._id,
    content:content
})

//push posts in userfiled
user.posts.push(post._id)
await user.save()
console.log(post)
res.redirect('/profile')
})





//for protected route
function isLoggedIn(req, res, next) {
    if (req.cookies.token === ""){ 
console.log('login first')
        res.redirect('/login')}
    else {
        //profile pe kiska hai wo pata chalega
        let data = jwt.verify(req.cookies.token, 'shhhh')
        req.user = data;
        next();


    }


    

}

app.listen(port ,( )=>{
    console.log(`app start on on PORT ${port}`)
})
