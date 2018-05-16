const request = require('supertest');

const server = require('../../server');

let token;

describe('Permission tests', () => {
  beforeAll((done) => {
    request(server)
      .post('/v1/login')
      .send({ email: 'test.user@fa.com', password: 'TestUser123&' })
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  afterAll(() => {
    server.close();
  });

  it("Should get a user's permissions by ID", (done) => {
    request(server)
      .get('/v1/users/2/permissions')
      .set('token', token)
      .end((err, res) => {
        expect(res.statusCode).toEqual(200);
        expect(res.body[0].name).toBeDefined();
        expect(res.body[0].permission).toBeDefined();
        expect(res.body[0].scope).toBeDefined();
        expect(res.body[0].role_id).toBeDefined();
        done();
      });
  });

  it('Should return an error message if user is not found', (done) => {
    request(server)
      .get('/v1/users/10001/permissions')
      .set('token', token)
      .end((err, res) => {
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual('User not found');
        done();
      });
  });
});
