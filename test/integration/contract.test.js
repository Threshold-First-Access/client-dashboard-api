const request = require('supertest');
const server = require('../../server');
const ids = require('../../seeds/seed').ids;

describe('Workflow contracts', () => {
  let token;
  beforeAll(() => {
    return request(server)
      .post('/v1/login')
      .send({ email: 'test.user@fa.com', password: 'TestUser123&' })
      .then((res) => {
        token = res.body.token;
      })
      .then(() => {
        return request(server)
          .post('/v1/companies')
          .send({
            name: 'Test Company',
            country: 'NG',
            slug: 'test-company-workflows',
          })
          .set('token', token);
      });
  });

  afterAll(() => {
    server.close();
  });

  describe("Update a workflow's contract", () => {
    it("updates a workflow's contract", () => {
      return request(server)
        .patch(`/v1/workflows/${ids.workflows[0]}/contract`)
        .set('token', token)
        .send({
          content: 'my:\n  yaml:\n    contract',
        })
        .then((res) => {
          // contract being expected to have the workflow_id
          // field is for legacy reasons
          expect(res.body.workflow_id).toEqual(ids.workflows[0]);
          expect(res.body.content).toEqual('my:\n  yaml:\n    contract');
        });
    });

    it('fails if the workflow does not exist', () => {
      return request(server)
        .patch('/v1/workflows/5e3ce591-a504-4f98-82b1-18d4366d973d/contract')
        .set('token', token)
        .send({
          content: 'my:\n  yaml:\n    contract',
        })
        .then((res) => {
          expect(res.body.message).toEqual('Workflow not found');
        });
    });

    it('fails if content yaml is invalid', () => {
      return request(server)
        .patch(`/v1/workflows/${ids.workflows[1]}/contract`)
        .set('token', token)
        .send({
          content: `
            root:
            base out of place
              - base
          `,
        })
        .then((res) => {
          expect(res.status).toEqual(400);
        });
    });

    it('preserves the previous configuration and analysis schema', () => {
      const workflowId = ids.workflows[1];
      const fetchConfigurationAndAnalysis = () => {
        return Promise.all([
          request(server)
            .get(`/v1/workflows/${workflowId}/configuration`)
            .set('token', token)
            .then((res) => res.body),
          request(server)
            .get(`/v1/workflows/${workflowId}/analysis_schema`)
            .set('token', token)
            .then((res) => res.body),
        ]);
      };
      return fetchConfigurationAndAnalysis()
        .then(([configuration, analysisSchema]) => {
          return request(server)
            .patch(`/v1/workflows/${workflowId}/contract`)
            .set('token', token)
            .send({ content: 'my:\n  yaml:\n    contract' })
            .then((res) => [configuration, analysisSchema, res]);
        })
        .then(([prevConfiguration, prevAnalysisSchema, res]) => {
          return fetchConfigurationAndAnalysis().then(
            ([configuration, analysisSchema]) => {
              expect(configuration).toEqual(prevConfiguration);
              expect(analysisSchema).toEqual(prevAnalysisSchema);
              expect(res.body.content).toEqual('my:\n  yaml:\n    contract');
            },
          );
        });
    });
  });

  describe("Get a workflow's contract", () => {
    it("returns a workflow's contract", () => {
      return request(server)
        .get(`/v1/workflows/${ids.workflows[0]}/contract`)
        .set('token', token)
        .then((res) => {
          expect(res.body.workflow_id).toEqual(ids.workflows[0]);
          expect(res.body.content).toBeDefined();
        });
    });

    it('fails if the workflow does not exist', () => {
      return request(server)
        .get('/v1/workflows/5e3ce591-a504-4f98-82b1-18d4366d973d/contract')
        .set('token', token)
        .then((res) => {
          expect(res.body.message).toEqual('Workflow not found');
        });
    });
  });
});
