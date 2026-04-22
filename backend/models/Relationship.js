const mongoose = require('mongoose');

const relationshipSchema = new mongoose.Schema({
  user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  interactionCount: { type: Number, default: 0 },
  mutualFriendsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Ensure a relationship is unique between two users (order-dependent for now)
relationshipSchema.index({ user1: 1, user2: 1 }, { unique: true });

module.exports = mongoose.model('Relationship', relationshipSchema);
