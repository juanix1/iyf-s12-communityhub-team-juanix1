import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Report from '../models/Report.js';

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Clearing existing sample records...');
    await Promise.all([
      Report.deleteMany({}),
      Comment.deleteMany({}),
      Post.deleteMany({}),
      User.deleteMany({}),
    ]);

    console.log('Creating sample commuter and moderator accounts...');
    const adminUser = await User.create({
      fullName: 'Amina Wanjiku (Moderator)',
      username: 'amina_mod',
      email: 'admin@njiacommunity.co.ke',
      password: 'Password123!',
      mainRoute: 'Thika Road',
      bio: 'Njia CommunityHub safety lead keeping Nairobi commuter updates helpful and respectful.',
      role: 'admin',
    });

    const brian = await User.create({
      fullName: 'Brian Otieno',
      username: 'brian_thika',
      email: 'brian@example.com',
      password: 'Password123!',
      mainRoute: 'Thika Road',
      bio: 'Daily commuter between Juja, Roysambu, and Nairobi CBD. Always tracking peak-hour matatu fares.',
    });

    const grace = await User.create({
      fullName: 'Grace Muthoni',
      username: 'grace_ngong',
      email: 'grace@example.com',
      password: 'Password123!',
      mainRoute: 'Ngong Road',
      bio: 'Travelling Adams Arcade to Town every morning. Sharing stage queues and Citi Hoppa availability.',
    });

    const kevin = await User.create({
      fullName: 'Kevin Kiprop',
      username: 'kevin_msa',
      email: 'kevin@example.com',
      password: 'Password123!',
      mainRoute: 'Mombasa Road',
      bio: 'Syokimau & Mlolongo commuter. Reporting Expressway exits and Bellevue bottlenecks.',
    });

    const now = Date.now();
    const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000);

    console.log('Creating realistic commuter route updates...');
    const posts = await Post.insertMany([
      {
        author: brian._id,
        route: 'Thika Road',
        fareKsh: 100,
        trafficStatus: 'Slow',
        description:
          'Traffic is moving slowly around Roysambu near TRM footbridge due to lane merging. Current fare to CBD is KSh 100. Super Metro and Lopha matatus are available, but queues at the stage are increasing.',
        helpfulVotes: [grace._id, kevin._id, adminUser._id],
        commentCount: 2,
        createdAt: hoursAgo(0.4),
        updatedAt: hoursAgo(0.4),
      },
      {
        author: grace._id,
        route: 'Ngong Road',
        fareKsh: 70,
        trafficStatus: 'Smooth',
        description:
          'Clear flow from Junction Mall past Adams Arcade all the way to Kenyatta National Hospital roundabout. Fare is steady at KSh 70 and plenty of buses are boarding immediately at Adams stage.',
        helpfulVotes: [brian._id],
        commentCount: 1,
        createdAt: hoursAgo(1.5),
        updatedAt: hoursAgo(1.5),
      },
      {
        author: kevin._id,
        route: 'Mombasa Road',
        fareKsh: 120,
        trafficStatus: 'Gridlock',
        description:
          'Heavy gridlock building up from Cabanas towards Belle Vue because of a stalled lorry on the inner lane. Normal matatus charging KSh 120 from Mlolongo. Consider taking the train from Syokimau if heading to CBD.',
        helpfulVotes: [brian._id, grace._id],
        commentCount: 1,
        createdAt: hoursAgo(3.2),
        updatedAt: hoursAgo(3.2),
      },
      {
        author: brian._id,
        route: 'Eastern Bypass',
        fareKsh: 80,
        trafficStatus: 'Smooth',
        description:
          'Kamakis to Ruiru interchange moving well this midday. Matatus charging KSh 80 and minimal waiting time at Kamakis stage.',
        helpfulVotes: [],
        commentCount: 0,
        createdAt: hoursAgo(7.5),
        updatedAt: hoursAgo(7.5),
      },
      {
        author: grace._id,
        route: 'Waiyaki Way',
        fareKsh: 80,
        trafficStatus: 'Slow',
        description:
          'Moderate buildup approaching Westlands roundabout from Kangemi. Fare from Uthiru is KSh 80. Embassava and Latema saccos operating normally.',
        helpfulVotes: [kevin._id],
        commentCount: 0,
        createdAt: hoursAgo(14),
        updatedAt: hoursAgo(14),
      },
    ]);

    console.log('Adding community comments...');
    const c1 = await Comment.create({
      post: posts[0]._id,
      author: grace._id,
      content: 'Thanks Brian! Is the outer service lane past Allsops clear or also backed up?',
    });

    await Comment.create({
      post: posts[0]._id,
      author: brian._id,
      parentComment: c1._id,
      content: 'Service lane is slightly faster right now, though matatus are stopping frequently at Garden City.',
    });

    await Comment.create({
      post: posts[1]._id,
      author: adminUser._id,
      content: 'Helpful update! Always good to know when Adams stage has no queue.',
    });

    await Comment.create({
      post: posts[2]._id,
      author: brian._id,
      content: 'Appreciate the heads-up on the Syokimau SGR commuter train option.',
    });

    console.log('Seed completed successfully!');
    console.log('Demo Accounts (Password for all: Password123!):');
    console.log('  Admin:    admin@njiacommunity.co.ke');
    console.log('  Commuter: brian@example.com');
    console.log('  Commuter: grace@example.com');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
