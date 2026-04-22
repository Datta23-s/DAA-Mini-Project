const express = require('express');
const router = express.Router();
const { buildGraph } = require('../algorithms/graphBuilder');
const { runDijkstra } = require('../algorithms/dijkstra');
const User = require('../models/User');

// GET /api/recommendations/:userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 1. Build the graph from DB
    const graph = await buildGraph();
    
    // 2. Run Dijkstra from source user
    const distances = runDijkstra(graph, userId);
    
    // 3. Get current user and all other users
    const currentUser = await User.findById(userId);
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    const existingFriends = new Set((currentUser.friends || []).map(id => id.toString()));
    const allUsers = await User.find({ _id: { $ne: userId } });

    // 4. Build recommendations with Dijkstra distance + interest overlap
    const recommendations = allUsers
      .filter(user => !existingFriends.has(user._id.toString()))
      .map(user => {
        const dist = distances[user._id.toString()];
        
        // Calculate interest overlap for fallback scoring
        const myInterests = (currentUser.interests || []).map(i => i.toLowerCase());
        const theirInterests = (user.interests || []).map(i => i.toLowerCase());
        const overlap = myInterests.filter(i => theirInterests.includes(i)).length;
        const interestScore = myInterests.length > 0 
          ? Math.round((overlap / Math.max(myInterests.length, 1)) * 60) 
          : 20; // Base score for new users

        // Dijkstra score (if path exists)
        const dijkstraScore = (dist !== undefined && dist !== Infinity) 
          ? Math.round(100 * (1 / (1 + dist))) 
          : 0;

        // Final score: prefer Dijkstra if available, otherwise use interest overlap
        const matchScore = dijkstraScore > 0 
          ? Math.min(99, dijkstraScore + interestScore) 
          : Math.max(15, interestScore + Math.floor(Math.random() * 25));

        return {
          _id: user._id,
          name: user.name,
          avatar: user.avatar,
          interests: user.interests,
          networkLevel: user.networkLevel || 'Explorer',
          matchScore,
          socialDistance: (dist !== undefined && dist !== Infinity) ? dist.toFixed(2) : 'Undiscovered',
          whyRecommended: dijkstraScore > 0 
            ? `Dijkstra path: ${dist.toFixed(2)} hops away`
            : overlap > 0 
              ? `${overlap} shared interest${overlap > 1 ? 's' : ''}`
              : 'Expand your network!'
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    res.json(recommendations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error calculating recommendations' });
  }
});


module.exports = router;
