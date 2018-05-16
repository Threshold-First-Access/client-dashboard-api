const request = require('supertest');
const nock = require('nock');

const server = require('../../server');
const reports = require('./../reports');

let token;

describe('Report tests', () => {
  beforeAll((done) => {
    request(server)
      .post('/v1/login')
      .send({
        email: 'companylevel@firstaccess.io',
        password: 'CompanyLevel123&',
      })
      .end((err, res) => {
        token = res.body.token;
        done();
      });

    nock('https://mock-reporting-api.localdomain')
      .post('/v1/reports')
      .reply(200, reports);
  });

  afterAll(() => {
    server.close();
  });

  it('Should get a list of reports by category', (done) => {
    request(server)
      .post('/v1/companies/1/reports')
      .send({})
      .set('token', token)
      .end((err, res) => {
        expect(res.body).toHaveProperty('__timestamp');
        expect(res.body).toHaveProperty('__version');
        expect(res.body).toHaveProperty('data');
        expect(res.body.data[0]).toHaveProperty('type');
        expect(Array.isArray(res.body.data)).toBeTruthy();
        done();
      });
  });
});
