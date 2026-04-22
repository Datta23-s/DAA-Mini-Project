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
    
    // 3. Get all users to calculate final ranking
    const allUsers = await User.find({ _id: { $ne: userId } });
    
    // 4. Get current user's friends to filter them out
    const currentUser = await User.findById(userId);
    const existingFriends = new Set(currentUser.friends.map(id => id.toString()));

    const recommendations = allUsers
      .filter(user => !existingFriends.has(user._id.toString()))
      .map(user => {
        const dist = distances[user._id.toString()];
        
        // Calculate Match % based on social distance
        // Since Dijkstra gives "shortest path", smaller distance = higher match
        // Formula: 100 * (1 / (1 + dist))
        const matchPercentage = dist === Infinity ? 0 : Math.round(100 * (1 / (1 + dist)));

        return {
          _id: user._id,
          name: user.name,
          avatar: user.avatar,
          interests: user.interests,
          matchPercentage,
          socialDistance: dist === Infinity ? 'Far' : dist.toFixed(2),
          whyRecommended: matchPercentage > 80 
            ? `Dijkstra path optimization found strong shared nodes.`
            : `Secondary link through common interest clusters.`
        };
      })
      .filter(rec => rec.matchPercentage > 0)
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 10); // Return Top 10

    res.json(recommendations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error calculating recommendations' });
  }
});

module.exports = router;
