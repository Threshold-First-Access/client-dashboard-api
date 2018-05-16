const request = require('supertest');
const server = require('../../server');
const ids = require('../../seeds/seed').ids;

describe('Workflow analysis schema', () => {
  let token;
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

  describe("Save a workflow's analysis schema", () => {
    it("saves a workflow's analysis schema", (done) => {
      request(server)
        .patch(`/v1/workflows/${ids.workflows[1]}/analysis_schema`)
        .set('token', token)
        .send({ content: 'analysis:\n  schema:' })
        .end((err, res) => {
          expect(res.status).toEqual(200);
          expect(res.body.content).toEqual('analysis:\n  schema:');
          done();
        });
    });

    it("saves a workflow's analysis schema when workflow has a numerical id", (done) => {
      request(server)
        .patch(`/v1/workflows/${ids.workflows[6]}/analysis_schema`)
        .set('token', token)
        .send({ content: 'analysis:\n  schema:' })
        .end((err, res) => {
          expect(res.status).toEqual(200);
          expect(res.body.content).toEqual('analysis:\n  schema:');
          done();
        });
    });

    it('fails if the workflow does not exist', (done) => {
      request(server)
        .patch(
          '/v1/workflows/5e3ce591-a504-4f98-82b1-18d4366d973d/analysis_schema',
        )
        .set('token', token)
        .send({ content: 'analysis:\n  schema:' })
        .end((err, res) => {
          expect(res.status).toEqual(404);
          expect(res.body.message).toEqual('Workflow not found');
          done();
        });
    });

    it('fails if schema is not valid YAML', (done) => {
      request(server)
        .patch(`/v1/workflows/${ids.workflows[1]}/analysis_schema`)
        .set('token', token)
        .send({ content: 'root:\nbase out of place\n  - base' })
        .end((err, res) => {
          expect(res.status).toEqual(400);
          expect(res.body.message).toContain('is not a valid YAML document');
          done();
        });
    });

    it('preserves the previous configuration and contract', () => {
      const workflowId = ids.workflows[1];
      const fetchConfigurationAndContract = () => {
        return Promise.all([
          request(server)
            .get(`/v1/workflows/${workflowId}/configuration`)
            .set('token', token)
            .then((res) => res.body),
          request(server)
            .get(`/v1/workflows/${workflowId}/contract`)
            .set('token', token)
            .then((res) => res.body),
        ]);
      };
      return fetchConfigurationAndContract()
        .then(([configuration, contract]) => {
          return request(server)
            .patch(`/v1/workflows/${workflowId}/analysis_schema`)
            .set('token', token)
            .send({ content: 'sections:\n  items: []' })
            .then((res) => [configuration, contract, res]);
        })
        .then(([prevConfiguration, prevContract, res]) => {
          return fetchConfigurationAndContract().then(
            ([configuration, contract]) => {
              expect(configuration).toEqual(prevConfiguration);
              expect(contract).toEqual(prevContract);
              expect(res.body.content).toEqual('sections:\n  items: []');
            },
          );
        });
    });
  });

  describe("Get a workflow's analysis schema", () => {
    const analysisSchema = { content: 'analysis:\n  schema:' };

    beforeAll((done) => {
      request(server)
        .patch(`/v1/workflows/${ids.workflows[1]}/analysis_schema`)
        .set('token', token)
        .send(analysisSchema)
        .end(done);
    });

    it("gets a workflow's analysis schema", (done) => {
      request(server)
        .get(`/v1/workflows/${ids.workflows[1]}/analysis_schema`)
        .set('token', token)
        .end((err, res) => {
          expect(res.status).toEqual(200);
          expect(res.body.content).toEqual(analysisSchema.content);
          done();
        });
    });

    it('404s when the workflow does not have an analysis schema', (done) => {
      request(server)
        .get(`/v1/workflows/${ids.workflows[2]}/analysis_schema`)
        .set('token', token)
        .end((err, res) => {
          expect(res.status).toEqual(404);
          expect(res.body.message).toEqual(
            'This workflow does not have an analysis schema.',
          );
          done();
        });
    });

    it('404s when the workflow does not exist', (done) => {
      request(server)
        .get(
          '/v1/workflows/5e3ce591-a504-4f98-82b1-18d4366d973d/analysis_schema',
        )
        .set('token', token)
        .end((err, res) => {
          expect(res.status).toEqual(404);
          expect(res.body.message).toEqual('Workflow not found.');
          done();
        });
    });

    it('403s if the user does not have permission to access analysis schema', (done) => {
      request(server)
        .post('/v1/login')
        .send({ email: 'applevel@firstaccess.io', password: 'AppLevel123&' })
        .end((err, res) => {
          request(server)
            .get(`/v1/workflows/${ids.workflows[1]}/analysis_schema`)
            .set('token', res.body.token)
            .end((error, { status, body }) => {
              expect(status).toEqual(403);
              expect(body.message).toEqual(
                'Forbidden due to insufficient permissions',
              );
              done();
            });
        });
    });
  });
});
