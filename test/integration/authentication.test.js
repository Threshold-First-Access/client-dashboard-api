const request = require('supertest');
const server = require('../../server');
const tokens = require('../../seed_data/tokens');

describe('Authorization', () => {
  const decodeToken = (t) => {
    const payload = new Buffer(t.split('.')[1], 'base64');
    return JSON.parse(payload);
  };
  let token;
  let userId;
  beforeAll((done) => {
    request(server)
      .post('/v1/login')
      .send({ email: 'test.user@fa.com', password: 'TestUser123&' })
      .end((err, res) => {
        token = res.body.token;
        userId = decodeToken(token).id;
        done();
      });
  });

  afterAll(() => {
    server.close();
  });

  it('should accept JWT in the Authorization header', () => {
    return request(server)
      .get(`/v1/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .then((res) => {
        expect(res.status).toEqual(200);
      });
  });

  it('should accept JWT in the token header', () => {
    return request(server)
      .get(`/v1/users/${userId}`)
      .set('token', token)
      .then((res) => {
        expect(res.status).toEqual(200);
      });
  });

  it('should accept a personal access token', () => {
    return request(server)
      .post('/v1/tokens')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'New Token' })
      .then((created) => {
        return request(server)
          .get(`/v1/users/${userId}`)
          .set('Authorization', `Bearer ${created.body.token}`)
          .then((res) => {
            expect(res.status).toBe(200);
          });
      });
  });

  it('should return an error if no token is provided', () => {
    return request(server)
      .get(`/v1/users/${userId}`)
      .then((res) => {
        expect(res.status).toEqual(403);
        expect(res.body.message).toEqual('No token provided.');
      });
  });

  it('should reject invalid JWTs', () => {
    return request(server)
      .get(`/v1/users/${userId}`)
      .set('Authorization', `Bearer eyJ0b2tlbiI6ImludmFsaWQifQ`)
      .then((res) => {
        expect(res.status).toEqual(403);
        expect(res.body.message).toEqual('Invalid token.');
      });
  });

  describe('personal access tokens', () => {
    it('should have the same permissions as the owner', () => {
      return Promise.all([
        request(server)
          .get('/v1/companies')
          .set('Authorization', `Bearer ${tokens()[0].token}`)
          .then((res) => {
            expect(res.status).toBe(403);
            expect(res.body.message).toBe(
              'Forbidden due to insufficient permissions',
            );
          }),
        request(server)
          .get(`/v1/users/${tokens()[0].user_id}`)
          .set('Authorization', `Bearer ${tokens()[0].token}`)
          .then((res) => {
            expect(res.status).toBe(200);
          }),
      ]);
    });
  });
});
