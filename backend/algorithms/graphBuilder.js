const User = require('../models/User');
const Relationship = require('../models/Relationship');

/**
 * Builds an adjacency list from MongoDB users and relationships
 */
const buildGraph = async () => {
  const users = await User.find({}, '_id');
  const relationships = await Relationship.find({});

  const graph = new Map();
  
  // Initialize map with all users
  users.forEach(u => graph.set(u._id.toString(), []));

  // Add edges
  relationships.forEach(rel => {
    const u1 = rel.user1.toString();
    const u2 = rel.user2.toString();
    
    // Weight formula: 1 / (mutual_friends + interaction_count + 1)
    const weight = 1 / (rel.mutualFriendsCount + rel.interactionCount + 1);

    // Undirected graph
    if (graph.has(u1)) graph.get(u1).push({ to: u2, weight });
    if (graph.has(u2)) graph.get(u2).push({ to: u1, weight });
  });

  return graph;
};

module.exports = { buildGraph };
