const request = require('supertest');
const server = require('../../server');
const ids = require('../../seeds/seed').ids;

describe('Workflows', () => {
  let token;
  beforeAll((done) => {
    request(server)
      .post('/v1/login')
      .send({ email: 'test.user@fa.com', password: 'TestUser123&' })
      .end((err, res) => {
        token = res.body.token;
        request(server)
          .post('/v1/companies')
          .send({
            name: 'Test Company',
            country: 'NG',
            slug: 'test-company-workflows',
          })
          .set('token', token)
          .end(() => {
            done();
          });
      });
  });

  afterAll(() => {
    server.close();
  });

  describe('Create workflow', () => {
    const workflow = {
      name: 'Student Borrower',
      slug: 'student-borrower',
    };
    it('should create a workflow', (done) => {
      request(server)
        .post('/v1/products/1/workflows')
        .send(workflow)
        .set('token', token)
        .end((err, res) => {
          expect(res.body.name).toEqual(workflow.name);
          expect(res.body.slug).toEqual(workflow.slug);
          done();
        });
    });

    it('should return an error if the product does not exist', (done) => {
      request(server)
        .post('/v1/products/123/workflows')
        .send({
          name: 'Senior Borrower',
          slug: 'senior-borrower',
        })
        .set('token', token)
        .end((err, res) => {
          expect(res.body.message).toEqual('Product does not exist');
          done();
        });
    });

    it('should return an error if the slug is already in use', (done) => {
      const dupWorkflow = {
        name: 'Existing Borrower',
        slug: 'existing-borrower',
      };
      request(server)
        .post('/v1/products/1/workflows')
        .send(dupWorkflow)
        .set('token', token)
        .end((err, res) => {
          expect(res.body.message).toEqual(
            `Slug '${dupWorkflow.slug}' is already in use`,
          );
          done();
        });
    });
  });

  describe('Get all workflows', () => {
    it('should return workflows in a product', (done) => {
      request(server)
        .get('/v1/products/2/workflows')
        .set('token', token)
        .end((error, res) => {
          expect(res.body.length).toEqual(3);
          expect(res.body[0].name).toEqual('Group Borrower');
          done();
        });
    });
  });

  describe('Get one workflow', () => {
    it('should return the workflow', (done) => {
      request(server)
        .get(`/v1/workflows/${ids.workflows[0]}`)
        .set('token', token)
        .end((error, res) => {
          expect(res.body.name).toEqual('Existing Borrower');
          expect(res.body.slug).toEqual('existing-borrower');
          done();
        });
    });

    it('should return an error if the workflow does not exist', (done) => {
      request(server)
        .get('/v1/workflows/123')
        .set('token', token)
        .end((err, res) => {
          expect(res.body.message).toEqual('Workflow not found');
          done();
        });
    });
  });

  describe('Update a workflow', () => {
    it('should updates a workflow', (done) => {
      const newProps = { name: 'a workflow' };
      request(server)
        .patch(`/v1/workflows/${ids.workflows[0]}`)
        .send(newProps)
        .set('token', token)
        .end((err, res) => {
          expect(res.body.name).toEqual(newProps.name);
          done();
        });
    });

    it('should return an error if the workflow does not exist', (done) => {
      request(server)
        .patch('/v1/workflows/42936336-9953-4f9b-a5c2-f30e7d250aa5')
        .set('token', token)
        .end((err, res) => {
          expect(res.body.message).toEqual('Workflow not found');
          done();
        });
    });
  });

  describe('Delete a workflow', () => {
    it('delete a workflow', (done) => {
      request(server)
        .delete(`/v1/workflows/${ids.workflows[3]}`)
        .set('token', token)
        .end((err, res) => {
          expect(res.body.message).toEqual('Workflow deleted successfully');
          done();
        });
    });

    it('should return an error if the workflow does not exist', (done) => {
      request(server)
        .delete('/v1/workflows/42936336-9953-4f9b-a5c2-f30e7d250aa5')
        .set('token', token)
        .end((err, res) => {
          expect(res.body.message).toEqual('Workflow not found');
          done();
        });
    });
  });
});
