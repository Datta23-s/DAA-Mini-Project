const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Relationship = require('../models/Relationship');

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// GET /api/users/explore (Find people to connect with)
router.get('/explore', auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.id);
    const exclude = [me._id, ...me.friends];
    
    const potentialPeers = await User.find({ _id: { $nin: exclude } })
      .select('name avatar interests networkLevel')
      .limit(20);
    
    res.json(potentialPeers);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// POST /api/users/connect/:targetId
router.post('/connect/:targetId', auth, async (req, res) => {
  try {
    const myId = req.user.id;
    const targetId = req.params.targetId;

    if (myId === targetId) return res.status(400).json({ message: 'Cannot connect with yourself' });

    // Check if already friends
    const me = await User.findById(myId);
    if (me.friends.includes(targetId)) return res.status(400).json({ message: 'Already connected' });

    // Create Relationship
    // Order IDs to maintain uniqueness index {user1, user2}
    const [u1, u2] = [myId, targetId].sort();
    
    const relationship = new Relationship({
      user1: u1,
      user2: u2,
      interactionCount: 1, // Start with 1 interaction
      mutualFriendsCount: 0 // Will calculate in a real app, placeholder for now
    });

    await relationship.save();

    // Update both users friends lists
    await User.findByIdAndUpdate(myId, { $addToSet: { friends: targetId } });
    await User.findByIdAndUpdate(targetId, { $addToSet: { friends: myId } });

    res.json({ message: 'Successfully connected!' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET /api/users/friends (My Network)
router.get('/friends', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', 'name avatar networkLevel interests');
    res.json(user.friends);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
