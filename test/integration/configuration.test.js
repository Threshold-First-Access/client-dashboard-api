const request = require('supertest');
const server = require('../../server');
const ids = require('../../seeds/seed').ids;

describe('Workflow configurations', () => {
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

  describe("Update a workflow's configuration", () => {
    const configuration = {
      sections: { info: { name: { type: 'NameField' } } },
    };
    it("updates a workflow's configuration", () => {
      return request(server)
        .patch(`/v1/workflows/${ids.workflows[0]}/configuration`)
        .set('token', token)
        .send({ configuration: JSON.stringify(configuration) })
        .then((res) => {
          // configuration being expected to have the workflow_id
          // field is for legacy reasons
          expect(res.body.workflow_id).toEqual(ids.workflows[0]);
          expect(res.body.schema).toEqual(configuration);
        });
    });

    it('fails if the workflow does not exist', () => {
      return request(server)
        .patch(
          '/v1/workflows/5e3ce591-a504-4f98-82b1-18d4366d973d/configuration',
        )
        .set('token', token)
        .send({ configuration: JSON.stringify(configuration) })
        .then((res) => {
          expect(res.body.message).toEqual('Workflow not found');
        });
    });

    it('preserves the previous contract and analysis schema', () => {
      const workflowId = ids.workflows[1];
      const fetchContractAndAnalysis = () => {
        return Promise.all([
          request(server)
            .get(`/v1/workflows/${workflowId}/contract`)
            .set('token', token)
            .then((res) => res.body),
          request(server)
            .get(`/v1/workflows/${workflowId}/analysis_schema`)
            .set('token', token)
            .then((res) => res.body),
        ]);
      };
      return fetchContractAndAnalysis()
        .then(([contract, analysisSchema]) => {
          return request(server)
            .patch(`/v1/workflows/${workflowId}/configuration`)
            .set('token', token)
            .send({ configuration: JSON.stringify(configuration) })
            .then((res) => [contract, analysisSchema, res]);
        })
        .then(([prevContract, prevAnalysisSchema, res]) => {
          return fetchContractAndAnalysis().then(
            ([contract, analysisSchema]) => {
              expect(contract).toEqual(prevContract);
              expect(analysisSchema).toEqual(prevAnalysisSchema);
              expect(res.body.schema).toEqual(configuration);
            },
          );
        });
    });
  });

  describe("Get a workflow's configuration", () => {
    it("returns a workflow's configuration", () => {
      return request(server)
        .get(`/v1/workflows/${ids.workflows[0]}/configuration`)
        .set('token', token)
        .then((res) => {
          // configuration being expected to have the workflow_id
          // field is for legacy reasons
          expect(res.body.workflow_id).toEqual(ids.workflows[0]);
          expect(res.body.schema).toBeDefined();
        });
    });

    it('fails if the workflow does not exist', () => {
      return request(server)
        .get('/v1/workflows/5e3ce591-a504-4f98-82b1-18d4366d973d/configuration')
        .set('token', token)
        .then((res) => {
          expect(res.body.message).toEqual('Workflow not found');
        });
    });
  });
});
