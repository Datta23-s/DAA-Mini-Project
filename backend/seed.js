const mongoose = require('mongoose');
const User = require('./models/User');
const Relationship = require('./models/Relationship');
require('dotenv').config();

const users = [
  { name: 'Alex Rivera', email: 'alex@example.com', password: 'password', interests: ['Neural Networks', 'Dijkstra', 'AI'], avatar: 'https://i.pravatar.cc/150?u=alex' },
  { name: 'Elena Soros', email: 'elena@example.com', password: 'password', interests: ['Data Architecture', 'Neuralink', 'Graph Theory'], avatar: 'https://i.pravatar.cc/150?u=elena' },
  { name: 'Marcus Chen', email: 'marcus@example.com', password: 'password', interests: ['Full Stack', 'Web3', 'Optimization'], avatar: 'https://i.pravatar.cc/150?u=marcus' },
  { name: 'Sarah Jenkins', email: 'sarah@example.com', password: 'password', interests: ['FinTech', 'Product', 'Graphs'], avatar: 'https://i.pravatar.cc/150?u=sarah' },
  { name: 'Jordan Smith', email: 'jordan@example.com', password: 'password', interests: ['D3.js', 'Visualization', 'Social Graphs'], avatar: 'https://i.pravatar.cc/150?u=jordan' },
  { name: 'Data Admin', email: 'admin@example.com', password: 'password', interests: ['Infrastructure', 'Automation'], avatar: 'https://i.pravatar.cc/150?u=admin' },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/connectiq');
    console.log('Clearing old data...');
    await User.deleteMany({});
    try {
      await mongoose.connection.db.collection('relationships').drop();
      console.log('Dropped relationships collection to clear old indexes.');
    } catch (e) {
      console.log('Relationships collection already empty or index not found.');
    }

    console.log('Seeding users...');
    const createdUsers = await User.insertMany(users);

    console.log('Seeding relationships (Friendships)...');
    const relationships = [
      { user1: createdUsers[0]._id, user2: createdUsers[1]._id, interactionCount: 10, mutualFriendsCount: 3 },
      { user1: createdUsers[0]._id, user2: createdUsers[4]._id, interactionCount: 5, mutualFriendsCount: 1 },
      { user1: createdUsers[1]._id, user2: createdUsers[2]._id, interactionCount: 15, mutualFriendsCount: 2 },
      { user1: createdUsers[4]._id, user2: createdUsers[3]._id, interactionCount: 8, mutualFriendsCount: 4 },
      { user1: createdUsers[4]._id, user2: createdUsers[2]._id, interactionCount: 3, mutualFriendsCount: 0 },
    ];

    await Relationship.insertMany(relationships);
    
    // Update friends list in User model
    for(const rel of relationships) {
      await User.findByIdAndUpdate(rel.user1, { $addToSet: { friends: rel.user2 } });
      await User.findByIdAndUpdate(rel.user2, { $addToSet: { friends: rel.user1 } });
    }

    console.log('Database Seeded Successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
