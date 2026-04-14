const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/user.model');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected for seeding...');
};

const seedUsers = [
  {
    name: 'Super Admin',
    email: 'admin@userms.com',
    password: 'Admin@123456',
    role: 'admin',
    status: 'active'
  },
  {
    name: 'Jane Manager',
    email: 'manager@userms.com',
    password: 'Manager@123456',
    role: 'manager',
    status: 'active'
  },
  {
    name: 'John Doe',
    email: 'user@userms.com',
    password: 'User@123456',
    role: 'user',
    status: 'active'
  },
  {
    name: 'Alice Smith',
    email: 'alice@userms.com',
    password: 'User@123456',
    role: 'user',
    status: 'active'
  },
  {
    name: 'Bob Johnson',
    email: 'bob@userms.com',
    password: 'User@123456',
    role: 'user',
    status: 'inactive'
  },
  {
    name: 'Carol Williams',
    email: 'carol@userms.com',
    password: 'Manager@123456',
    role: 'manager',
    status: 'active'
  }
];

const seed = async () => {
  try {
    await connectDB();

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create admin first (no createdBy reference)
    const [adminUser] = await User.create([seedUsers[0]]);
    console.log(`Created admin: ${adminUser.email}`);

    // Create rest with createdBy set to admin
    const restUsers = seedUsers.slice(1).map(u => ({
      ...u,
      createdBy: adminUser._id,
      updatedBy: adminUser._id
    }));

    const created = await User.create(restUsers);
    created.forEach(u => console.log(`Created ${u.role}: ${u.email}`));

    console.log('\n=== SEED COMPLETE ===');
    console.log('Login credentials:');
    console.log('  Admin:   admin@userms.com    / Admin@123456');
    console.log('  Manager: manager@userms.com  / Manager@123456');
    console.log('  User:    user@userms.com     / User@123456');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
