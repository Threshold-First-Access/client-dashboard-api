const request = require('supertest');
const server = require('../../server');
const ids = require('../../seeds/seed').ids;

describe('Notes', () => {
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

  afterAll(() => {
    server.close();
  });

  describe('Create a note', () => {
    const note = { content: 'A note' };
    it('Creates a note', (done) => {
      request(server)
        .post(`/v1/applications/${ids.applications[1]}/notes`)
        .send(note)
        .set('token', token)
        .end((err, res) => {
          expect(res.body.content).toEqual(note.content);
          done();
        });
    });

    it('Returns an error if an application does not exist', (done) => {
      request(server)
        .post('/v1/applications/110/notes')
        .send(note)
        .set('token', token)
        .end((err, res) => {
          expect(res.status).toEqual(404);
          expect(res.body.message).toBe('Application does not exist');
          done();
        });
    });
  });
});
