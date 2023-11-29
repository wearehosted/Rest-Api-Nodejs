import Post from "../models/postModel.js";
import User from "../models/userModel.js";

const createPost = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser) return res.status(401).json({ message: "Unauthorized" });

    const { text, postImg } = req.body;

    if (!text)
      return res.status(400).json({ message: "Text or image is required" });

    const postedBy = currentUser._id;
    console.log(postedBy);
    const maxLength = 500;
    if (text.length > maxLength) {
      return res
        .status(400)
        .json({ error: `Text must be less than ${maxLength} characters` });
    }

    const newPost = new Post({ postedBy, text, postImg });
    await newPost.save();
    res.status(201).json({ message: "Post created successfully", newPost });
  } catch (error) {
    console.log("[CREATE POST ERROR]", error.message);
    return res.status(500).json({ message: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser) return res.status(400).json({ message: "Unauthorized" });

    const { postId } = req.params;
    console.log("postId", postId);

    const post = await Post.findById({ _id: postId });
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.postedBy.toString() !== currentUser._id.toString())
      return res.status(401).json({ message: "Unauthorized to delete post" });

    const deletedPost = await Post.findByIdAndDelete({ _id: postId });

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("[DELETE POST ERROR]", error.message);
    return res.status(500).json({ message: error.message });
  }
};

const getPostsByUserId = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser)
      return res
        .status(401)
        .json({ message: "Login to view this users's posts" });

    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const userPosts = await Post.find({ postedBy: userId })
      .populate("postedBy", "username profileImg")
      .sort({ createdAt: -1 });

    res.status(200).json({ message: "User posts found", userPosts });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("[GET POSTS BY USERNAME ERROR]", error.message);
  }
};

const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId).populate(
      "postedBy",
      "username profileImg"
    );
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json({ message: "Post found", post });
  } catch (error) {
    console.log("[GET POST BY ID ERROR]", error.message);
    return res.status(500).json({ message: error.message });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("postedBy", "username profileImg")
      .sort({ createdAt: -1 });

    res.status(200).json({ message: "All posts found", posts });
  } catch (error) {
    console.log("[GET ALL POSTS ERROR]", error.message);
    return res.status(500).json({ message: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { text } = req.body;

    if (!req.user) return res.status(401).json({ message: "Login to comment" });

    const userId = req.user._id;
    const authorProfileImg = req.user.profilePic;
    const authorUsername = req.user.username;

    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }
    const post = await Post.findById({ _id: postId });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = { userId, text, authorProfileImg, authorUsername };
    post.comments.push(comment);
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.log("[ADD COMMENT ERROR]", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export {
  createPost,
  deletePost,
  getPostsByUserId,
  getPostById,
  getAllPosts,
  addComment,
};
