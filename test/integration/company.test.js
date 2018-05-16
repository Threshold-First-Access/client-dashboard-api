const request = require('supertest');
const countries = require('countryjs');

const server = require('../../server');

let token;

const companyData = {
  name: 'Andela Inc',
  slug: 'andela',
  country: 'NG',
};

const endpoint = '/v1/companies';

describe('POST /company', () => {
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

  it('should create a new company', (done) => {
    const language = countries.languages(companyData.country).toString();
    const countryName = countries.name(companyData.country).toString();
    request(server)
      .post('/v1/companies')
      .send(companyData)
      .set('token', token)
      .end((err, res) => {
        expect(res.statusCode).toEqual(201);
        expect(res.body.name).toEqual(companyData.name);
        expect(res.body.country).toEqual(companyData.country);
        expect(res.body.language).toEqual(language);
        expect(res.body.country_name).toEqual(countryName);
        done();
      });
  });

  it('should fail when same company is recreated', (done) => {
    request(server)
      .post('/v1/companies')
      .send(companyData)
      .set('token', token)
      .end((err, res) => {
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual(
          expect.stringMatching(/already registered/i),
        );
        done();
      });
  });

  it('should fail when all required fields are missing', (done) => {
    request(server)
      .post('/v1/companies')
      .send({})
      .set('token', token)
      .end((err, res) => {
        expect(res.statusCode).toEqual(400);
        expect(res.body.code).toEqual('BadRequest');
        done();
      });
  });

  it('should fail when company name is missing', (done) => {
    const data = Object.assign({}, companyData);
    delete data.name;
    request(server)
      .post('/v1/companies')
      .send(data)
      .set('token', token)
      .end((err, res) => {
        expect(res.statusCode).toEqual(400);
        expect(res.body.code).toEqual('BadRequest');
        done();
      });
  });

  it('should fail when country is missing', (done) => {
    const data = Object.assign({}, companyData);
    delete data.country;
    request(server)
      .post('/v1/companies')
      .send(data)
      .set('token', token)
      .end((err, res) => {
        expect(res.statusCode).toEqual(400);
        expect(res.body.code).toEqual('BadRequest');
        done();
      });
  });

  it('It should fail when a wrong country code is used', (done) => {
    const data = Object.assign({}, companyData);
    data.country = 'XX';
    request(server)
      .post('/v1/companies')
      .send(data)
      .set('token', token)
      .end((err, res) => {
        expect(res.statusCode).toEqual(400);
        expect(res.body.code).toEqual('BadRequest');
        done();
      });
  });
});

describe('PATCH /company/:id', () => {
  afterAll(() => {
    server.close();
  });

  it('Should update a company when name and country is sent', (done) => {
    const data = Object.assign({}, companyData);
    data.name = 'Tinca';
    data.slug = 'tinca-tz';
    data.country = 'TZ';

    request(server)
      .post(endpoint)
      .send(data)
      .set('token', token)
      .end((err, res) => {
        if (res) {
          request(server)
            .patch(`${endpoint}/${res.body.id}`)
            .send({ name: 'Omin Inc', country: 'ZA' })
            .set('token', token)
            .end((error, response) => {
              expect(response.statusCode).toEqual(200);
              expect(response.body.country).toEqual('ZA');
              expect(response.body.name).toEqual('Omin Inc');
              expect(response.body.country_name).toEqual('South Africa');
              expect(response.body.language).toContain(
                'af,en,nr,st,ss,tn,ts,ve,xh,zu',
              );
              expect(response.body.timezone).toContain('UTC+02:00');
              done();
            });
        }
      });
  });

  it('Should update a company when name is sent', (done) => {
    const data = Object.assign({}, companyData);
    data.name = 'Tinca';
    data.slug = 'tinca-ng';
    data.country = 'NG';

    request(server)
      .post(endpoint)
      .send(data)
      .set('token', token)
      .end((err, res) => {
        if (res) {
          request(server)
            .patch(`${endpoint}/${res.body.id}`)
            .send({ name: 'Omin Inc' })
            .set('token', token)
            .end((error, response) => {
              expect(response.statusCode).toEqual(200);
              expect(response.body.country).toEqual('NG');
              expect(response.body.name).toEqual('Omin Inc');
              expect(response.body.country_name).toEqual('Nigeria');
              expect(response.body.language).toEqual('en');
              expect(response.body.timezone).toEqual('UTC+01:00');
              done();
            });
        }
      });
  });

  it('Should update a company when a country is sent', (done) => {
    const data = Object.assign({}, companyData);
    data.name = 'Tomatoe';
    data.slug = 'tomatoe-ng';
    data.country = 'NG';

    request(server)
      .post(endpoint)
      .send(data)
      .set('token', token)
      .end((err, res) => {
        if (res) {
          request(server)
            .patch(`${endpoint}/${res.body.id}`)
            .send({ country: 'GH' })
            .set('token', token)
            .end((error, response) => {
              expect(response.statusCode).toEqual(200);
              expect(response.body.country).toEqual('GH');
              expect(response.body.name).toEqual('Tomatoe');
              expect(response.body.country_name).toEqual('Ghana');
              expect(response.body.language).toEqual('en');
              expect(response.body.timezone).toEqual('UTC');
              done();
            });
        }
      });
  });

  it('Should update a company when a language, currency and timezone is sent', (done) => {
    const data = Object.assign({}, companyData);
    data.name = 'Ita Etim';
    data.slug = 'ita-item-ke';
    data.country = 'KE';

    const updateData = {
      language: 'en',
      currency: 'Yen',
      timezone: 'UTC+001',
    };

    request(server)
      .post(endpoint)
      .send(data)
      .set('token', token)
      .end((err, res) => {
        if (res) {
          request(server)
            .patch(`${endpoint}/${res.body.id}`)
            .send(updateData)
            .set('token', token)
            .end((error, response) => {
              expect(response.statusCode).toEqual(200);
              expect(response.body.country).toEqual('KE');
              expect(response.body.name).toEqual('Ita Etim');
              expect(response.body.currency).toEqual('Yen');
              expect(response.body.language).toEqual('en');
              expect(response.body.timezone).toEqual('UTC+001');
              done();
            });
        }
      });
  });

  it('Should fail when no data is passed', (done) => {
    const data = Object.assign({}, companyData);
    data.name = 'Edem';
    data.slug = 'edem-ke';
    data.country = 'KE';

    request(server)
      .post(endpoint)
      .send(data)
      .set('token', token)
      .end((err, res) => {
        if (res) {
          request(server)
            .patch(`${endpoint}/${res.body.id}`)
            .send({})
            .set('token', token)
            .end((error, response) => {
              expect(response.statusCode).toEqual(400);
              expect(response.body.code).toEqual('BadRequest');
              expect(response.body.message).toEqual(
                '"value" must contain at least one of [name, country, country_name, timezone, currency, language]',
              );
              done();
            });
        }
      });
  });

  it('Should fail when a non existent company is used', (done) => {
    const data = Object.assign({}, companyData);
    data.name = 'Edem';
    data.slug = 'edem-ke-2';
    data.country = 'KE';
    const id = Date.now();

    request(server)
      .patch(`${endpoint}/${id}`)
      .send(data)
      .set('token', token)
      .end((err, response) => {
        expect(response.statusCode).toEqual(404);
        expect(response.body.message).toEqual('This company does not exist');
        done();
      });
  });

  it('Should fail when a bad country is used', (done) => {
    const data = Object.assign({}, companyData);
    data.name = `${Date.now()} America`;
    data.slug = 'company-us';
    data.country = 'KE';

    request(server)
      .post(endpoint)
      .send(data)
      .set('token', token)
      .end((err, res) => {
        if (res) {
          request(server)
            .patch(`${endpoint}/${res.body.id}`)
            .send({ country: 'Nigeria' })
            .set('token', token)
            .end((error, response) => {
              expect(response.statusCode).toEqual(400);
              expect(response.body.code).toEqual('BadRequest');
              done();
            });
        }
      });
  });

  it('Should fail when updating to a company that already exist', (done) => {
    const data = Object.assign({}, companyData);
    data.name = 'Captain America';
    data.slug = 'captain-america';
    data.country = 'KE';

    request(server)
      .post(endpoint)
      .send(data)
      .set('token', token)
      .end((err, res) => {
        if (res) {
          request(server)
            .patch(`${endpoint}/${res.body.id}`)
            .send({ name: 'Nigeria Inc', country: 'NG' })
            .set('token', token)
            .end((error, response) => {
              if (response) {
                request(server)
                  .patch(`${endpoint}/1`)
                  .send({ name: 'Nigeria Inc', country: 'NG' })
                  .set('token', token)
                  .end((errors, responses) => {
                    expect(responses.statusCode).toEqual(400);
                    expect(responses.body.message).toEqual(
                      "A company with the name 'Nigeria Inc' exists in the country NG",
                    );
                    done();
                  });
              }
            });
        }
      });
  });
});

describe('GET /companies/:id/users', () => {
  afterAll(() => {
    server.close();
  });

  it('should get users for a company', (done) => {
    /**
     * Create a company
     */
    request(server)
      .post('/v1/companies')
      .send({
        name: 'FairMan Inc',
        slug: 'fairman-inc',
        country: 'NG',
      })
      .set('token', token)
      .end((serverErr, serverRes) => {
        if (serverRes) {
          /**
           * Create a user and attached to the created company
           */
          request(server)
            .post('/v1/users')
            .send({
              company_id: serverRes.body.id,
              first_name: 'Celestine',
              last_name: 'Omin',
              email: 'friedman2@andela.com',
              password: 'Frenchman1234!',
            })
            .set('token', token)
            .end((error, response) => {
              /**
               * Retrieve users for the created company
               */
              request(server)
                .get(`/v1/companies/${serverRes.body.id}/users`)
                .set('token', token)
                .end((err, res) => {
                  expect(res.statusCode).toEqual(200);
                  expect(res.body[0].first_name).toEqual(
                    response.body.first_name,
                  );
                  expect(res.body[0].last_name).toEqual(
                    response.body.last_name,
                  );
                  expect(res.body[0].email).toEqual(response.body.email);
                  expect(res.body[0].type).toEqual(response.body.type);
                  expect(res.body[0].password).toEqual(response.body.password);
                  done();
                });
            });
        }
      });
  });

  it('should fail for a company that does not exist', (done) => {
    request(server)
      .get(`/v1/companies/${Date.now()}/users`)
      .set('token', token)
      .end((err, res) => {
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual('Company not found');
        done();
      });
  });

  it('should fail for a company with invalid ID', (done) => {
    request(server)
      .get('/v1/companies/12SDDJ/users')
      .set('token', token)
      .end((err, res) => {
        expect(res.statusCode).toEqual(400);
        expect(res.body.code).toEqual('BadRequest');
        expect(res.body.message).toEqual('"id" must be a number');
        done();
      });
  });
});

describe('GET /companies', () => {
  afterAll(() => {
    server.close();
  });

  it('should get all companies', (done) => {
    request(server)
      .get(endpoint)
      .set('token', token)
      .end((err, res) => {
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeDefined();
        expect(res.body[0]).toHaveProperty('name');
        expect(res.body[0]).toHaveProperty('country');
        expect(res.body[0]).toHaveProperty('country_name');
        expect(res.body[0]).toHaveProperty('timezone');
        expect(res.body[0]).toHaveProperty('currency');
        expect(res.body[0]).toHaveProperty('language');
        done();
      });
  });
});
