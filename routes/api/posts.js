const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

//@route    POST api/posts
//@desc     create a post
//@access   private
router.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();
      res.json(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

//@route    GET api/posts
//@desc     Get all posts
//@access   private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

//@route    GET api/posts/:id
//@desc     Get post by ID
//@access   private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error(error.message);

    // Check if the ID is valid
    const valid = mongoose.Types.ObjectId.isValid(req.params.user_id);
    if (!valid) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    res.status(500).send('Server error');
  }
});

//@route    DELETE api/posts/:id
//@desc     Delete post by ID
//@access   private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check if the post matches the user that trying to delete it
    // We need to add toString() method because post.user is an Object and
    // req.user.id is a string
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await post.remove();

    res.json({ msg: 'Post removed' });
  } catch (error) {
    console.error(error.message);

    // Check if the ID is valid
    const valid = mongoose.Types.ObjectId.isValid(req.params.user_id);
    if (!valid) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    res.status(500).send('Server error');
  }
});

//@route    PUT api/posts/like/:id
//@desc     Like post by post ID
//@access   private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if this post already been liked by this user
    // We filter through the like to see if there is a like from a user
    // with the same id. If there is then the filter will return something
    // greater then 0. If that's the case that means that the post already
    // been like by this user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: 'Post already liked' });
    }

    // If this post wasn't liked by this user,
    // we push to the top of the array the id of the user that liked
    // the current post.
    post.likes.unshift({ user: req.user.id });

    post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

//@route    PUT api/posts/unlike/:id
//@desc     Unlike post by post ID
//@access   private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if this post already been liked by this user
    // We filter through the like to see if there is a like from a user
    // with the same id. If there isn't then the filter will return length equal to 0.
    // If that's the case that means that the post hasn't been liked by this user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: 'Post has not yet been liked' });
    }

    // Get the index of the like that should be removed
    // By comparing each id of each like in the map array
    // To the id we got in the URL (:id)
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    //Remove the like by the index we found
    post.likes.splice(removeIndex, 1);

    post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

//@route    POST api/posts/comment/:id
//@desc     Add comment to a post by post ID
//@access   private
router.post(
  '/comment/:id',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // So we can add new comment we need user and post info
      // Getting user info from DB
      const user = await User.findById(req.user.id).select('-password');
      // Getting post info from DB
      const post = await Post.findById(req.params.id);

      // Building new comment
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      // Push the new comment into the post's comments
      post.comments.unshift(newComment);

      // save the post with the new comment to DB
      await post.save();

      // Return the comments for the post
      res.json(post.comments);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

//@route    DELETE api/posts/comment/:id/:comment_id
//@desc     Delete comment from a post by post ID and comment ID
//@access   private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Pull out comment out of post
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    // Verify comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Verify it's the right user trying to delete
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);

    //Remove the like by the index we found
    post.comments.splice(removeIndex, 1);

    post.save();
    res.json(post.comments);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
