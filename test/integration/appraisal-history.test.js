const request = require('supertest');

const server = require('../../server');
const ids = require('../../seeds/seed').ids;

describe('Appraisal History', () => {
  let token;
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
  });

  afterAll(() => server.close());

  it('Throws an error when reopening a draft appraisal', (done) => {
    request(server)
      .post(`/v1/workflows/${ids.workflows[5]}/applications`)
      .set('token', token)
      .send({
        data: {
          sections: {
            first_section: {
              previous_loan: false,
              applied_principal: 5000,
              name: 'Test Name',
            },
          },
        },
      })
      .end((err, res) => {
        const id = res.body.id;
        request(server)
          .post(`/v1/applications/${id}/reopen`)
          .set('token', token)
          .send({ comment: 'reopened' })
          .end((errror, result) => {
            expect(result.statusCode).toEqual(400);
            expect(result.body.message).toEqual(
              'Draft appraisals cannot be reopened',
            );
            done();
          });
      });
  });

  it('throws error when reopening appraisal without a comment', (done) => {
    request(server)
      .post(`/v1/applications/${ids.applications[12]}/reopen`)
      .set('token', token)
      .send({})
      .end((err, res) => {
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('"comment" is required');
        done();
      });
  });

  it('Reopens an appraisal', (done) => {
    request(server)
      .post(`/v1/applications/${ids.applications[12]}/reopen`)
      .send({ comment: 'reopening appraisal' })
      .set('token', token)
      .end((err, res) => {
        expect(res.statusCode).toEqual(200);
        expect(res.body.state).toEqual('REOPENED');
        done();
      });
  });
});
