const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Post = require("./models/Post");
const User = require("./models/User");

dotenv.config();

mongoose.connect(process.env.MONGO_URL)
  .then(async () => {
    console.log("Connected to MongoDB successfully!");
    const posts = await Post.find({});
    console.log(`Found ${posts.length} posts:`);
    for (const post of posts) {
      const user = await User.findById(post.userId);
      console.log(`Post ID: ${post._id}, Desc: "${post.desc}", Post userId: ${post.userId}, User exists: ${!!user}, Username: ${user ? user.username : 'N/A'}`);
    }
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
