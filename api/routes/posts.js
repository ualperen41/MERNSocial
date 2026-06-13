const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

// create a post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    console.log("POST CREATE HATASI:", err);
    res.status(500).json({ error: err.message });
  }
});

// update a post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("the post has been updated");
    } else {
      res.status(403).json("you can update only your post");
    }
  } catch (err) {
    console.log("POST UPDATE HATASI:", err);
    res.status(500).json({ error: err.message });
  }
});

// delete a post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("the post has been deleted");
    } else {
      res.status(403).json("you can delete only your post");
    }
  } catch (err) {
    console.log("POST DELETE HATASI:", err);
    res.status(500).json({ error: err.message });
  }
});

// like / dislike a post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    console.log("POST LIKE HATASI:", err);
    res.status(500).json({ error: err.message });
  }
});

// get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    console.log("POST GET HATASI:", err);
    res.status(500).json({ error: err.message });
  }
});

// get timeline posts
router.get("/timeline/:userId", async (req, res) => {
  try {
    console.log("1. Timeline isteği alındı. userId:", req.params.userId);
    
    const currentUser = await User.findById(req.params.userId);
    console.log("2. Kullanıcı bulundu:", currentUser ? currentUser.username : "KULLANICI YOK");
    
    if (!currentUser) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }
    
    console.log("3. Kullanıcının followings listesi:", currentUser.followings);
    
    const userPosts = await Post.find({ userId: currentUser._id });
    console.log("4. Kullanıcının post sayısı:", userPosts.length);
    
    const friendPosts = await Promise.all(
      (currentUser.followings || []).map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    console.log("5. Arkadaşların post sayısı:", friendPosts.length);
    
    const timeline = userPosts.concat(...friendPosts);
    console.log("6. Toplam timeline post sayısı:", timeline.length);
    
    res.status(200).json(timeline);
  } catch (err) {
    console.log("TIMELINE HATA DETAYI:", err);
    console.log("Hata mesajı:", err.message);
    console.log("Hata stack:", err.stack);
    res.status(500).json({ 
      error: err.message,
      stack: err.stack 
    });
  }
});

// get user all posts
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json("Kullanıcı bulunamadığı için postlar çekilemedi");
    }
    const posts = await Post.find({ userId: user._id });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;