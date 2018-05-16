/* global it describe beforeAll afterAll:true */
const request = require('supertest');
const joi = require('joi');

const server = require('../../server');
const roleSchema = require('../../app/validations/role/add_role');

let token;
let user;
let company;

const securityGroup = {
  name: 'Test role',
  description: 'Test role description',
};

describe('Role tests', () => {
  beforeAll((done) => {
    request(server)
      .post('/v1/login')
      .send({ email: 'test.user@fa.com', password: 'TestUser123&' })
      .end((err, res) => {
        token = res.body.token;
        request(server)
          .post('/v1/companies')
          .send({ name: 'Test Company', country: 'NG' })
          .set('token', token)
          .end((error, result) => {
            company = result.body;
            done();
          });
      });
  });

  afterAll(() => {
    server.close();
  });

  it('Should create a new role', (done) => {
    request(server)
      .post('/v1/roles')
      .send(securityGroup)
      .set('token', token)
      .end((err, res) => {
        expect(res.status).toEqual(201);
        done();
      });
  });

  it('Should raise error when empty role is created', (done) => {
    request(server)
      .post('/v1/roles')
      .send({})
      .set('token', token)
      .end((err, res) => {
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('"name" is required');
        done();
      });
  });

  it('Should return list of roles', (done) => {
    request(server)
      .post('/v1/roles')
      .send({
        name: 'Test role 2',
        description: 'Test description 2',
      })
      .set('token', token)
      .end((err, res) => {
        request(server)
          .get('/v1/roles')
          .set('token', token)
          .expect(200)
          .then((response) => {
            joi.assert(res.body[0], roleSchema);
            expect(typeof response.body).toEqual('object');
            done();
          });
      });
  });

  it('Should get a role by ID', (done) => {
    request(server)
      .post('/v1/roles')
      .send({
        name: 'Test role 3',
        description: 'Test description 3',
      })
      .set('token', token)
      .end((err, res) => {
        request(server)
          .get(`/v1/roles/${res.body.id}`)
          .set('token', token)
          .end((error, response) => {
            expect(response.statusCode).toEqual(200);
            expect(response.body.name).toEqual('Test role 3');
            expect(response.body.description).toEqual('Test description 3');
            done();
          });
      });
  });

  it('Should fail when a role is not found', (done) => {
    request(server)
      .get('/v1/roles/10001')
      .set('token', token)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual('Role not found');
        done();
      });
  });

  it('Should fail when a duplicate role is created within first access', (done) => {
    const role = { name: 'Test Name', description: 'Test description' };
    request(server)
      .post('/v1/roles')
      .send(role)
      .set('token', token)
      .end(() => {
        request(server)
          .post('/v1/roles')
          .send(role)
          .set('token', token)
          .end((error, result) => {
            expect(result.statusCode).toEqual(400);
            expect(result.body.message).toEqual(
              'Role already exists with that name: Test Name',
            );
            done();
          });
      });
  });

  it('Should fail when a duplicate role is created within a company', (done) => {
    const role = {
      name: 'Test Name',
      description: 'Test description',
      company_id: company.id,
    };
    request(server)
      .post('/v1/roles')
      .send(role)
      .set('token', token)
      .end(() => {
        request(server)
          .post('/v1/roles')
          .send(role)
          .set('token', token)
          .end((error, result) => {
            expect(result.statusCode).toEqual(400);
            expect(result.body.message).toEqual(
              'Role already exists with that name: Test Name',
            );
            done();
          });
      });
  });

  describe('Adding a user to a role', () => {
    beforeAll((done) => {
      request(server)
        .post('/v1/users')
        .send({
          first_name: 'Test',
          last_name: 'User',
          email: 'addusertorole@fa.com',
          password: 'TestUser1&',
        })
        .set('token', token)
        .end((err, res) => {
          user = res.body;
          done();
        });
    });

    it('Should add a user to a role', (done) => {
      request(server)
        .post(`/v1/roles/1/users/${user.id}`)
        .send({ assign: true })
        .set('token', token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(201);
          expect(res.body.message).toEqual(
            'User role has been succesfully updated',
          );
          done();
        });
    });

    it('Should throw error when adding a duplicate user to a role', (done) => {
      request(server)
        .post(`/v1/roles/1/users/${user.id}`)
        .send({ assign: true })
        .set('token', token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(400);
          expect(res.body.message).toEqual('User already exists for this role');
          done();
        });
    });

    it('Should throw error when role is not found', (done) => {
      request(server)
        .post(`/v1/roles/100/users/${user.id}`)
        .send()
        .set('token', token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(404);
          expect(res.body.message).toEqual('Role not found');
          done();
        });
    });

    it('Should throw error when role is not found', (done) => {
      request(server)
        .del('/v1/roles/100')
        .set('token', token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(404);
          expect(res.body.message).toEqual('Role not found');
          done();
        });
    });

    it('Should delete a role', (done) => {
      request(server)
        .post('/v1/roles')
        .send({
          name: 'Test role 4',
          description: 'Test description 4',
        })
        .set('token', token)
        .end((err, res) => {
          request(server)
            .del(`/v1/roles/${res.body.id}`)
            .set('token', token)
            .end((error, response) => {
              expect(response.statusCode).toEqual(200);
              done();
            });
        });
    });

    it('Should throw error when user is not found', (done) => {
      request(server)
        .post('/v1/roles/1/users/100')
        .send()
        .set('token', token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(404);
          expect(res.body.message).toEqual('User not found');
          done();
        });
    });
  });

  describe('Adding permission to a role', () => {
    let role;
    beforeAll((done) => {
      request(server)
        .post('/v1/roles')
        .send({ name: 'Test Role 4', description: 'Test Description' })
        .set('token', token)
        .end((err, res) => {
          role = res.body;
          done();
        });
    });

    it('Should add a permission to a role', (done) => {
      request(server)
        .post(`/v1/roles/${role.id}/permissions`)
        .send({
          name: 'Create role',
          permission: 'CAN_CREATE_ROLE',
          scope: 'application',
          assigned: true,
        })
        .set('token', token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(201);
          expect(res.body.name).toEqual('Test Role 4');
          expect(res.body.permissions[0].name).toEqual('Create role');
          expect(res.body.permissions[0].permission).toEqual('CAN_CREATE_ROLE');
          expect(res.body.permissions[0].scope).toEqual('application');
          expect(res.body.permissions[0].role_id).toEqual(role.id);
          done();
        });
    });

    it('Should throw error adding a permission to a role if role does not exist', (done) => {
      request(server)
        .post('/v1/roles/100/permissions')
        .send({
          name: 'Create role',
          permission: 'CAN_CREATE_ROLE',
          scope: 'application',
          assigned: true,
        })
        .set('token', token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(404);
          expect(res.body.message).toEqual('Role not found');
          done();
        });
    });

    it('Should throw eror if permission does not exist', (done) => {
      request(server)
        .post(`/v1/roles/${role.id}/permissions`)
        .send({
          name: 'Create role',
          permission: 'INVALID_ROLE',
          scope: 'application',
          assigned: true,
        })
        .set('token', token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(404);
          expect(res.body.message).toEqual(
            'Invalid. Permission does not exist.',
          );
          done();
        });
    });
  });
});
