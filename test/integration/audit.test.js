const request = require('supertest');
const server = require('../../server');

let token;

describe('POST /company', () => {
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

  it('Should get audit logs', (done) => {
    request(server)
      .get('/v1/audit_logs?page=1&size=10')
      .set('token', token)
      .end((err, res) => {
        expect(res.statusCode).toEqual(200);
        done();
      });
  });
});
