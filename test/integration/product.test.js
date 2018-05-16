const request = require('supertest');

const server = require('../../server');

let token;

describe('Product tests', () => {
  let company;

  beforeAll((done) => {
    request(server)
      .post('/v1/login')
      .send({ email: 'test.user@fa.com', password: 'TestUser123&' })
      .end((err, res) => {
        token = res.body.token;
        request(server)
          .post('/v1/companies')
          .send({
            name: 'Test Company Branches',
            country: 'NG',
            slug: 'test-company-ng',
          })
          .set('token', token)
          .end((error, response) => {
            company = response.body;
            done();
          });
      });
  });

  afterAll(() => {
    server.close();
  });

  describe('POST /products', () => {
    it('Should create a new product for a company', (done) => {
      request(server)
        .post(`/v1/companies/${company.id}/products`)
        .send({
          name: 'Test Product 1',
          type: 'group',
        })
        .set('token', token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(201);
          expect(res.body.name).toEqual('Test Product 1');
          expect(res.body.type).toEqual('group');
          expect(res.body.company_id).toEqual(company.id);
          done();
        });
    });

    it('Should fail when a duplicate product is created for a company', (done) => {
      request(server)
        .post(`/v1/companies/${company.id}/products`)
        .send({
          name: 'Test Product 1',
          type: 'individual',
        })
        .set('token', token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(409);
          expect(res.body.message).toEqual(
            "A product with the name 'Test Product 1' exists in the same company",
          );
          done();
        });
    });

    it('Should fail when invalid name is provided for a product', (done) => {
      request(server)
        .post(`/v1/companies/${company.id}/products`)
        .send({
          name: '',
          type: 'group',
        })
        .set('token', token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(400);
          expect(res.body.message).toEqual('"name" is not allowed to be empty');
          done();
        });
    });

    it('Should fail when invalid type is provided for a product', (done) => {
      request(server)
        .post(`/v1/companies/${company.id}/products`)
        .send({
          name: 'Valid product',
          type: 'randomType',
        })
        .set('token', token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(400);
          expect(res.body.message).toEqual(
            '"type" must be one of [individual, group]',
          );
          done();
        });
    });

    it('Should fail when an empty product is created', (done) => {
      request(server)
        .post(`/v1/companies/${company.id}/products`)
        .send({})
        .set('token', token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(400);
          done();
        });
    });

    it('Should fail when a product for no company is created', (done) => {
      request(server)
        .post('/v1/companies/1001/products')
        .send({
          name: 'Valid product',
          type: 'randomType',
          company_id: 1001,
        })
        .set('token', token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(400);
          done();
        });
    });
  });

  describe('GET /products', () => {
    it('Should get a list of company products', (done) => {
      request(server)
        .get('/v1/companies/1/products')
        .set('token', token)
        .end((err, res) => {
          expect(Array.isArray(res.body)).toBeTruthy();
          expect(res.body[0].name).toBeDefined();
          expect(res.body[0].type).toBeDefined();
          expect(res.body[0].company_id).toEqual(1);

          // this is to make sure the next assertions are not pointless
          expect(res.body.some((p) => p.workflows.length)).toBe(true);

          res.body.forEach((product) => {
            product.workflows.forEach((workflow) => {
              // workflow being require to have these fields is for legacy reasons
              expect(workflow.contract_id).toBeDefined();
              expect(workflow.configuration_id).toBeDefined();
              expect(workflow.configurations).toHaveLength(1);
              expect(workflow.configuration).toEqual(
                expect.objectContaining({
                  workflow_id: expect.anything(),
                }),
              );
              expect(workflow.configuration).toEqual(
                workflow.configurations[0],
              );
            });
          });
          done();
        });
    });
  });
});
