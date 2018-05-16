const request = require('supertest');

const server = require('../../server');
const ids = require('../../seeds/seed').ids;

describe('Company app authorization tests', () => {
  let companyUser;
  let clientApp;

  beforeAll((done) => {
    return request(server)
      .post('/v1/login')
      .send({ email: 'admin@firstaccess.com', password: 'SuperAdmin123&' })
      .end((err, res) => {
        request(server)
          .post('/v1/companies/1/apps')
          .send({ name: 'name', description: 'description' })
          .set('Authorization', `Bearer ${res.body.token}`)
          .end((error, resp) => {
            clientApp = resp.body;
            request(server)
              .get('/v1/companies/1/users')
              .set('Authorization', `Bearer ${res.body.token}`)
              .end((errors, result) => {
                companyUser = result.body.find(
                  (user) => user.email === 'companylevel@firstaccess.io',
                );
              });
            done();
          });
      });
  });

  afterAll(() => {
    server.close();
  });

  it('Creates an appraisal on behalf of a user', (done) => {
    request(server)
      .post(`/v1/workflows/${ids.workflows[5]}/applications`)
      .send({
        meta: {
          source: { client_id: clientApp.id },
          user: { email: 'companylevel@firstaccess.io' },
        },
      })
      .set('Authorization', `Bearer ${clientApp.access_key}`)
      .end((err, res) => {
        expect(res.body.client_id).toEqual(clientApp.id);
        expect(res.body.user_id).toEqual(companyUser.id);
        done();
      });
  });

  it('throws error if owner ID does not match app company id', (done) => {
    request(server)
      .post(`/v1/workflows/${ids.workflows[5]}/applications`)
      .send({
        meta: {
          source: { client_id: clientApp.id },
          user: { email: 'test.user@fa.com' },
        },
      })
      .set('Authorization', `Bearer ${clientApp.access_key}`)
      .end((err, res) => {
        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toEqual('Invalid token.');
        done();
      });
  });

  it('throws error if  client id is not provided', (done) => {
    request(server)
      .post(`/v1/workflows/${ids.workflows[5]}/applications`)
      .send({
        meta: {
          user: { email: 'companylevel@firstaccess.io' },
        },
      })
      .set('Authorization', `Bearer ${clientApp.access_key}`)
      .end((err, res) => {
        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toEqual('Invalid token.');
        done();
      });
  });

  it('throws error if owner is not provided', (done) => {
    request(server)
      .post(`/v1/workflows/${ids.workflows[5]}/applications`)
      .send({
        meta: {
          source: { client_id: clientApp.id },
        },
      })
      .set('Authorization', `Bearer ${clientApp.access_key}`)
      .end((err, res) => {
        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toEqual('Invalid token.');
        done();
      });
  });
});
