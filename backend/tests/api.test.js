import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_for_njia_communityhub_2026';

import app from '../app.js';

let mongoServer;
let userToken;
let secondUserToken;
let adminToken;
let createdPostId;
let createdCommentId;

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

after(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Njia CommunityHub REST API Integration Tests', () => {
  it('1. Registers a new commuter account and returns a JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Wanjiku Kamau',
        username: 'wanjiku_k',
        email: 'wanjiku@example.com',
        password: 'Password123!',
        mainRoute: 'Thika Road',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
    assert.equal(res.body.user.username, 'wanjiku_k');
    assert.equal(res.body.user.password, undefined);
    userToken = res.body.token;
  });

  it('2. Logs in an existing user with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: 'wanjiku@example.com',
        password: 'Password123!',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
  });

  it('3. Blocks unauthenticated users from creating route updates', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({
        route: 'Thika Road',
        fareKsh: 100,
        trafficStatus: 'Slow',
        description: 'Unauthenticated attempt to post traffic conditions.',
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('4. Allows authenticated users to create a route update', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        route: 'Thika Road',
        fareKsh: 100,
        trafficStatus: 'Slow',
        description: 'Traffic is moving slowly around Roysambu. Current fare is KSh 100.',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.post.route, 'Thika Road');
    assert.equal(res.body.post.fareKsh, 100);
    createdPostId = res.body.post._id;
  });

  it('5. Fetches posts with route and traffic filters', async () => {
    const res = await request(app).get('/api/posts?route=Thika%20Road&trafficStatus=Slow');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.posts));
    assert.equal(res.body.posts.length, 1);
    assert.equal(res.body.posts[0]._id, createdPostId);
  });

  it('6. Allows post owner to edit their own route update', async () => {
    const res = await request(app)
      .put(`/api/posts/${createdPostId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        fareKsh: 80,
        trafficStatus: 'Smooth',
        description: 'Traffic has cleared around Roysambu and fare dropped to KSh 80.',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.post.fareKsh, 80);
    assert.equal(res.body.post.trafficStatus, 'Smooth');
  });

  it('7. Prevents another user from editing or deleting someone else’s post', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Peter Omondi',
        username: 'peter_o',
        email: 'peter@example.com',
        password: 'Password123!',
        mainRoute: 'Mombasa Road',
      });

    secondUserToken = regRes.body.token;

    const editAttempt = await request(app)
      .put(`/api/posts/${createdPostId}`)
      .set('Authorization', `Bearer ${secondUserToken}`)
      .send({ fareKsh: 50 });

    assert.equal(editAttempt.status, 403);

    const deleteAttempt = await request(app)
      .delete(`/api/posts/${createdPostId}`)
      .set('Authorization', `Bearer ${secondUserToken}`);

    assert.equal(deleteAttempt.status, 403);
  });

  it('8. Allows authenticated users to add and delete their own comments', async () => {
    const commentRes = await request(app)
      .post(`/api/posts/${createdPostId}/comments`)
      .set('Authorization', `Bearer ${secondUserToken}`)
      .send({ content: 'Thank you for the fare update!' });

    assert.equal(commentRes.status, 201);
    assert.equal(commentRes.body.commentCount, 1);
    createdCommentId = commentRes.body.comment._id;

    const deleteRes = await request(app)
      .delete(`/api/comments/${createdCommentId}`)
      .set('Authorization', `Bearer ${secondUserToken}`);

    assert.equal(deleteRes.status, 200);
    assert.equal(deleteRes.body.commentCount, 0);
  });

  it('9. Restricts admin endpoints to users with admin role', async () => {
    const nonAdminRes = await request(app)
      .get('/api/admin/reports')
      .set('Authorization', `Bearer ${userToken}`);

    assert.equal(nonAdminRes.status, 403);

    // Promote user in DB for admin verification
    const User = mongoose.model('User');
    await User.findOneAndUpdate({ username: 'wanjiku_k' }, { role: 'admin' });

    const adminRes = await request(app)
      .get('/api/admin/reports')
      .set('Authorization', `Bearer ${userToken}`);

    assert.equal(adminRes.status, 200);
    assert.equal(adminRes.body.success, true);
  });

  it('10. Allows post owner to delete their own post', async () => {
    const res = await request(app)
      .delete(`/api/posts/${createdPostId}`)
      .set('Authorization', `Bearer ${userToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });
});
