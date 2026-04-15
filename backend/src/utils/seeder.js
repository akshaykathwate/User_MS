const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/user.model');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected for seeding...');
};

// Only the admin is seeded. All other users register via POST /api/auth/register
const adminSeed = {
  name: 'Super Admin',
  email: 'admin@userms.com',
  password: 'Admin@123456',
  role: 'admin',
  status: 'active'
};

const seed = async () => {
  try {
    await connectDB();

    // Upsert admin: don't wipe existing users
    const existing = await User.findOne({ email: adminSeed.email });
    if (existing) {
      console.log('Admin already exists — skipping seed.');
      process.exit(0);
    }

    const admin = await User.create(adminSeed);
    console.log(`\u2713 Created admin: ${admin.email}`);

    console.log('\n=== SEED COMPLETE ===');
    console.log('Admin login:  admin@userms.com  /  Admin@123456');
    console.log('All other users must self-register via the Sign Up page.');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
