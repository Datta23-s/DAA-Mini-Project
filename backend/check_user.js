const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/connectiq')
  .then(async () => {
    const user = await User.findOne({ email: 'datta@gmail.com' });
    console.log('USER_EXISTS:', user ? 'YES' : 'NO');
    process.exit();
  });
