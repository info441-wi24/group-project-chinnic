import mongoose from "mongoose";

let models = {};

const connectToDatabase = async () => {
  try {
    console.log("Connecting to MongoDB");
    await mongoose.connect("mongodb+srv://DubSpaceUser:DubSpacePassword@cluster0.j0lkezc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
    console.log("Connected to MongoDB");

    // Define the Post schema and model
    const postSchema = new mongoose.Schema({
      username: String,
      title: String,
      post: String,
      hashtag: [String],
      likes: [String],
      created_date: Date
    });

    models.Post = mongoose.model('Post', postSchema);

    const commentSchema = new mongoose.Schema({
      username: String,
      comment: String,
      likes: [String],
      post: {type: mongoose.Schema.Types.ObjectId, ref: "Post"},
      created_date: Date
    })

    models.Comment = mongoose.model('Comment', commentSchema);

    const userInfoSchema = new mongoose.Schema({
      username: String,
      preferred_name: String,
      pronouns: String,
      major: String,
      year: String,
      fun_fact: String
  })
  
  models.UserInfo = mongoose.model('UserInfo', userInfoSchema) 

    console.log("Mongoose models created");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
};

connectToDatabase();

export default models;

