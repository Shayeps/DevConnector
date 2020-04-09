const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const config = require('config');
const request = require('request');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route    GET api/profile/me
//@desc     Get current user profile
//@access   private
router.get('/me', auth, async (req, res) => {
  try {
    // req.user.id comes from the auth middleware. After the decoding we can access it
    // user reffers to the Profile model where inside of it we reffer to the User model _id
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Server error');
  }
});

//@route    POST api/profile
//@desc     Create or update user profile
//@access   private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      location,
      website,
      bio,
      skills,
      status,
      githubusername,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
    } = req.body;

    // Build profile object - set the fields e.g profileFields.user is the
    // user inside profileFields object.
    // req.user.id comes from the token that we decoded in auth process
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    // Run through skills inserted by user and put them into an array
    if (skills) {
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }

    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      // Look for profile in DB
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        // If profile found, update it in DB
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }

      // If profile is not found, we'll create new one
      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

//@route    GET api/profile
//@desc     Get all profiles
//@access   public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);

    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

//@route    GET api/profile/user/:user_id
//@desc     Get profile by user id
//@access   public
router.get('/user/:user_id', async (req, res) => {
  try {
    // req.params.user_id comes from the URL :user_id param
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) return res.status(400).json({ msg: 'Profile not found' });

    res.json(profile);
  } catch (error) {
    console.error(error.message);

    // Check if the ID is valid
    const valid = mongoose.Types.ObjectId.isValid(req.params.user_id);
    if (!valid) {
      return res.status(400).json({ msg: 'Profile not found' });
    }

    res.status(500).send('Server error');
  }
});

//@route    Delete api/profile
//@desc     Delete profile, user & posts
//@access   private
router.delete('/', auth, async (req, res) => {
  try {
    //@todo  Delete posts

    // Delete profile - we look by user because thats the identifier
    await Profile.findOneAndRemove({ user: req.user.id });

    // Delete user - we look by _id because thats the identifier
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: 'User deleted' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

//@route    PUT api/profile/experience
//@desc     Add experience in profile
//@access   private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'From date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

//@route    Delete api/profile/experience/:exp_id
//@desc     Delete experience in profile
//@access   private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    // Get whole profile for user
    const profile = await Profile.findOne({ user: req.user.id });

    // Get the index of the experience that should be removed
    // By comparing each id of each experience in the map array
    // To the id we got in the URL (:exp_id)
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    // If from some reason the index is not valid we return error
    if (removeIndex < 0) {
      return res.status(400).json({ msg: 'Experience not found' });
    }

    //Remove the exp by the index we found
    profile.experience.splice(removeIndex, 1);

    profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

//@route    PUT api/profile/education
//@desc     Add education in profile
//@access   private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required').not().isEmpty(),
      check('degree', 'Degree is required').not().isEmpty(),
      check('fieldofstudy', 'Feild of study is required').not().isEmpty(),
      check('from', 'From date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

//@route    Delete api/profile/education/:edu_id
//@desc     Delete education in profile
//@access   private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    // Get whole profile for user
    const profile = await Profile.findOne({ user: req.user.id });

    // Get the index of the education that should be removed
    // By comparing each id of each education in the map array
    // To the id we got in the URL (:edu_id)
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    // If from some reason the index is not valid we return error
    if (removeIndex < 0) {
      return res.status(400).json({ msg: 'education not found' });
    }

    //Remove the exp by the index we found
    profile.education.splice(removeIndex, 1);

    profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

//@route    GET api/profile/github/:username
//@desc     Get user repos from github
//@access   public
router.get('/github/:username', (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubClientID'
      )}/&client_secret=${config.get('githubClientSercret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' },
    };

    request(options, (error, response, body) => {
      if (error) console.error(error);

      if (response.statusCode !== 200) {
        res.status(404).json({ msg: 'No Github profile found' });
      }

      res.json(JSON.parse(body));
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
