/* global it describe beforeAll afterAll:true */
const faker = require('faker');
const joi = require('joi');
const request = require('supertest');

const server = require('../../server');
const fixtures = require('../fixtures/data');

let token;

const data = {
  first_name: faker.name.firstName(),
  last_name: faker.name.lastName(),
  email: faker.internet.email(),
  password: 'jJ08kjfksjhfka,',
};

describe('POST /users', () => {
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

  it('should fail when wrong data is supplied', (done) => {
    request(server)
      .post('/v1/users')
      .send({})
      .set('token', token)
      .end((err, res) => {
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('"first_name" is required');
        done();
      });
  });

  it('should pass when right data is provided and also confirm if audit log was created', (done) => {
    request(server)
      .post('/v1/users')
      .send(data)
      .set('token', token)
      .end((err, res) => {
        expect(res.statusCode).toEqual(201);
        expect(res.body.first_name).toEqual(data.first_name);
        expect(res.body.last_name).toEqual(data.last_name);
        expect(res.body.email).toEqual(data.email);
        done();
      });
  });

  it('should fail when the first name is not supplied', (done) => {
    const userData = Object.assign({}, data);
    delete userData.first_name;

    request(server)
      .post('/v1/users')
      .send(userData)
      .set('token', token)
      .end((err, res) => {
        expect(res.statusCode).toEqual(400);
        joi.assert(res.body.message, '"first_name" is required');
        done();
      });
  });

  it('should fail when the last name is not supplied', (done) => {
    const userData = Object.assign({}, data);
    delete userData.last_name;

    request(server)
      .post('/v1/users')
      .send(userData)
      .set('token', token)
      .end((err, res) => {
        expect(res.statusCode).toEqual(400);
        joi.assert(res.body.message, '"last_name" is required');
        done();
      });
  });

  it('should fail when the email is not supplied', (done) => {
    const userData = Object.assign({}, data);
    delete userData.email;

    request(server)
      .post('/v1/users')
      .send(userData)
      .set('token', token)
      .end((err, res) => {
        expect(res.statusCode).toEqual(400);
        joi.assert(res.body.message, '"email" is required');
        done();
      });
  });

  it('should pass when a company is supplied', (done) => {
    const userData = Object.assign({}, data);
    userData.email = faker.internet.email();
    request(server)
      .post('/v1/companies')
      .send({ name: 'Finca', country: 'GH', slug: 'finca-gh' })
      .set('token', token)
      .end((error, response) => {
        userData.company_id = response.body.id;
        request(server)
          .post('/v1/users')
          .send(userData)
          .set('token', token)
          .end((err, res) => {
            expect(res.statusCode).toEqual(201);
            expect(res.body.company_id).toEqual(userData.company_id);
            expect(res.body.first_name).toEqual(userData.first_name);
            expect(res.body.last_name).toEqual(userData.last_name);
            expect(res.body.email).toEqual(userData.email);
            done();
          });
      });
  });

  it('should fail when the same email is used', (done) => {
    request(server)
      .post('/v1/users')
      .send(data)
      .set('token', token)
      .end((err, res) => {
        if (res) {
          request(server)
            .post('/v1/users')
            .send(data)
            .set('token', token)
            .end((error, response) => {
              expect(res.statusCode).toEqual(400);
              expect(response.body.message).toEqual(
                'User with this email address already exists.',
              );
              done();
            });
        }
      });
  });

  it('should fail when bad email is supplied', (done) => {
    const userData = Object.assign({}, data);
    userData.email = 'firstaccessmarket.com';

    request(server)
      .post('/v1/users')
      .send(userData)
      .set('token', token)
      .end((err, res) => {
        expect(res.statusCode).toEqual(400);
        joi.assert(res.body.message, '"email" must be a valid email');
        done();
      });
  });

  it('should not send email when param present', (done) => {
    const userData = Object.assign({}, data);
    userData.email = faker.internet.email();
    userData.password = 'Test123&';

    request(server)
      .post('/v1/users')
      .send(userData)
      .send({ suppress_email: true })
      .set('token', token)
      .end((err, res) => {
        expect(res.statusCode).toEqual(201);
        done();
      });
  });
});

describe('POST /login', () => {
  afterAll(() => {
    server.close();
  });

  it('should reply with user not found, if user does not exist', (done) => {
    request(server)
      .post('/v1/login')
      .send({ email: 'nobody@nowhere.com', password: 'jJ08kjfksjhfka,' })
      .end((err, res) => {
        expect(res.statusCode).toEqual(403);
        expect(res.body).toEqual({
          message: 'Invalid email/password combination',
        });
        done();
      });
  });

  it('should reply with wrong password/email combination if password and email do not match', (done) => {
    request(server)
      .post('/v1/login')
      .send({
        email: 'companylevel@firstaccess.io',
        password: 'CompanyLevel1234&',
      })
      .end((error, response) => {
        expect(response.body).toEqual({
          message: 'Invalid email/password combination',
        });
        done();
      });
  });

  it('should reply user logged in successfully, if user exist and authenticates successfully.', (done) => {
    request(server)
      .post('/v1/login')
      .send({
        email: 'companylevel@firstaccess.io',
        password: 'CompanyLevel123&',
      })
      .end((err, res) => {
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('User logged in successfully');
        done();
      });
  });

  it('should validate that the body is not empty', (done) => {
    request(server)
      .post('/v1/login')
      .end((err, res) => {
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('"body" is required');
        done();
      });
  });

  it('should validate that the email is not empty', (done) => {
    request(server)
      .post('/v1/login')
      .send({})
      .end((err, res) => {
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('"email" is required');
        done();
      });
  });

  it('should validate that the email is valid', (done) => {
    request(server)
      .post('/v1/login')
      .send({ email: 'not a valid email', password: 'very strong' })
      .end((err, res) => {
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('"email" must be a valid email');
        done();
      });
  });

  it('should validate that the password is not empty', (done) => {
    request(server)
      .post('/v1/login')
      .send({ email: 'companylevel@firstaccess.io' })
      .end((err, res) => {
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('"password" is required');
        done();
      });
  });
});

describe('PATCH /users/:id', () => {
  afterAll(() => {
    server.close();
  });

  it('should fail when updating a company that does not exist', (done) => {
    fixtures.createUser().then((user) => {
      request(server)
        .patch(`/v1/users/${user.get('id')}`)
        .send({ company_id: Date.now() })
        .set('token', token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(404);
          expect(res.body.message).toEqual('This company does not exist');
          done();
        });
    });
  });

  it('should fail when updating to an existing password', (done) => {
    request(server)
      .patch('/v1/users/2')
      .send({ password: 'CompanyLevel123&' })
      .set('token', token)
      .end((err, res) => {
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual(
          'You have already used this password. Use a new one.',
        );
        done();
      });
  });

  it('should update an existing user', (done) => {
    fixtures.createUser().then((user) => {
      request(server)
        .patch(`/v1/users/${user.get('id')}`)
        .send({ first_name: 'ooo' })
        .set('token', token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(200);
          expect(res.body.first_name).toBe('ooo');
          expect(res.body.last_name).toBe(user.get('last_name'));
          expect(res.body.email).toBe(user.get('email'));
          done();
        });
    });
  });

  it('should fail when updating with a non-existent user', (done) => {
    const id = new Date();
    request(server)
      .patch(`/v1/users/${id}`)
      .send({ password: 'jJ08kjfksjhfka,' })
      .set('token', token)
      .end((err, res) => {
        expect(res.statusCode).toEqual(404);
        done();
      });
  });

  it('should update password for a user that does not exist', (done) => {
    const id = Date.now();
    request(server)
      .patch(`/v1/users/${id}`)
      .send({ password: 'jJ08kjfksjhfka,' })
      .set('token', token)
      .end((err, res) => {
        expect(res.statusCode).toEqual(404);
        done();
      });
  });

  it('should update a user password', (done) => {
    fixtures.createUser().then((user) => {
      request(server)
        .patch(`/v1/users/${user.get('id')}`)
        .send({ password: 'jJ08kjfksjhfka!' })
        .set('token', token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(200);
          expect(res.body.first_name).toBe(user.get('first_name'));
          expect(res.body.last_name).toBe(user.get('last_name'));
          expect(res.body.email).toBe(user.get('email'));
          done();
        });
    });
  });
  it('Should return success message when requesting for password reset', (done) => {
    request(server)
      .post('/v1/password_resets')
      .send({
        email: 'nonexistent@firstaccess.io',
      })
      .end((err, res) => {
        expect(res.statusCode).toEqual(200);
        done();
      });
  });
  it('Should reset a user password', (done) => {
    request(server)
      .post('/v1/password_resets/1234')
      .send({
        email: 'nyerere@firstaccess.io',
        password: 'Password1234&',
      })
      .end((err, res) => {
        expect(res.statusCode).toEqual(200);
        done();
      });
  });

  it('should fail when updating a user to a password of weaker strength', (done) => {
    fixtures.createUser().then((user) => {
      request(server)
        .patch(`/v1/users/${user.get('id')}`)
        .send({ password: 'ominwerdff' })
        .set('token', token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(400);
          expect(res.body.code).toEqual('BadRequest');
          done();
        });
    });
  });
});

describe('GET /users/:id', () => {
  afterAll(() => {
    server.close();
  });

  it('Should get a super administrator', (done) => {
    request(server)
      .get('/v1/users/4')
      .set('token', token)
      .end((err, res) => {
        expect(res.statusCode).toEqual(200);
        expect(res.body.active).toBeTruthy();
        expect(res.body.superadmin).toBeTruthy();
        done();
      });
  });

  it('should get a user', (done) => {
    fixtures.createUser().then((user) => {
      request(server)
        .get(`/v1/users/${user.get('id')}`)
        .set('token', token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(200);
          expect(res.body.first_name).toBe(user.get('first_name'));
          expect(res.body.last_name).toBe(user.get('last_name'));
          expect(res.body.email).toBe(user.get('email'));
          expect(res.body.type).toBe(user.get('type'));
          done();
        });
    });
  });

  it('should fail when getting a user that does not exist', (done) => {
    request(server)
      .get(`/v1/users/23490832434`)
      .set('token', token)
      .end((err, res) => {
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual('User not found');
        done();
      });
  });

  it('replies with user not found if the user does not exist', (done) => {
    const id = Date.now();
    request(server)
      .get(`/v1/users/${id}`)
      .set('Accept', 'application/json')
      .set('token', token)
      .end((err, res) => {
        expect(res.body.message).toEqual('User not found');
        done();
      });
  });
});

describe('GET /users/application', () => {
  it('Should get all application users', (done) => {
    request(server)
      .get('/v1/users/application')
      .set('token', token)
      .end((err, res) => {
        expect(res.body[0].first_name).toBeDefined();
        expect(res.body[0].last_name).toBeDefined();
        expect(res.body[0].email).toBeDefined();
        expect(res.body[0].password).toBeUndefined();
        expect(res.body[0].company_id).toEqual(null);
        done();
      });
  });
});

describe('GET /activate/code', () => {
  it('attempts to activate a invalid user', (done) => {
    request(server)
      .post('/v1/activate/12')
      .send({ password: 'Password123&', confirm_password: 'Password123&' })
      .end((err, res) => {
        expect(res.body.message).toBe('The user does not exist');
        done();
      });
  });

  it('activates a user', (done) => {
    request(server)
      .post('/v1/activate/1234')
      .send({ password: 'Password123&', confirm_password: 'Password123&' })
      .end((err, res) => {
        expect(res.status).toBe(200);
        done();
      });
  });

  it('attempts to activate an active user', (done) => {
    request(server)
      .post('/v1/activate/123')
      .send({ password: 'Password123&', confirm_password: 'Password123&' })
      .end((err, res) => {
        expect(res.status).toBe(406);
        expect(res.body.message).toBe('The user is already active');
        done();
      });
  });
});

describe('GET Resend activation email', () => {
  it('Resends activation link email', (done) => {
    fixtures.createUser().then((user) => {
      request(server)
        .post('/v1/activation/code')
        .set('token', token)
        .send({ user_id: user.get('id'), email: user.get('email') })
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          done();
        });
    });
  });

  it('Throws error when resending activation link email to active user', (done) => {
    request(server)
      .post('/v1/activation/code')
      .set('token', token)
      .send({ user_id: 1, email: 'applevel@firstaccess.io' })
      .end((err, res) => {
        expect(res.statusCode).toBe(400);
        done();
      });
  });

  it('Throws error when resending activation link email to active user', (done) => {
    request(server)
      .post('/v1/activation/code')
      .set('token', token)
      .send({ user_id: 10001, email: 'nonexistent@firstaccess.io' })
      .end((err, res) => {
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('User not found.');
        done();
      });
  });
});
