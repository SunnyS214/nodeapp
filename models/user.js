const mongoose= require('mongoose')
mongoose.connect(process.env.MONGO_URL);

const schema = mongoose.Schema({
    username:String,
    name:String,
    email:String,
    password:String,
    age:Number,
    profilepic:{
        type:String,
        default:"deafault.png"
    },
    posts:[
        {type:mongoose.Schema.Types.ObjectId, ref:"post"}
    ]
})
module.exports= mongoose.model("user" , schema)
