const request = require('supertest');
const server = require('../../server');

describe('Client Apps', () => {
  let token;

  beforeAll(() => {
    return request(server)
      .post('/v1/login')
      .send({ email: 'test.user@fa.com', password: 'TestUser123&' })
      .then((res) => {
        token = res.body.token;
      });
  });

  afterAll(() => {
    server.close();
  });

  describe('POST /companies/:companyId/apps', () => {
    it('should create a client app', () => {
      return request(server)
        .post('/v1/companies/1/apps')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'My App' })
        .then((res) => {
          expect(res.status).toBe(201);
        });
    });

    it('should require CAN_CREATE_API_CLIENT_APP permission', () => {
      return request(server)
        .post('/v1/login')
        .send({
          email: 'companylevel@firstaccess.io',
          password: 'CompanyLevel123&',
        })
        .then((res1) => {
          return request(server)
            .post('/v1/companies/1/apps')
            .set('Authorization', `Bearer ${res1.body.token}`)
            .send({ name: 'Another App' })
            .then((res2) => {
              expect(res2.status).toBe(403);
              expect(res2.body.message).toBe(
                'Forbidden due to insufficient permissions',
              );
            });
        });
    });

    it('should handle non-existent companies', () => {
      return request(server)
        .post('/v1/companies/100000/apps')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Another App' })
        .then((res) => {
          expect(res.ok).toBeFalsy();
        });
    });
  });

  describe('GET /companies/:companyId/apps', () => {
    it('should return previously created client apps', () => {
      return Promise.all([
        request(server)
          .post('/v1/companies/1/apps')
          .set('Authorization', `Bearer ${token}`)
          .send({ name: 'First App' })
          .then((res) => res.body.id),
        request(server)
          .post('/v1/companies/1/apps')
          .set('Authorization', `Bearer ${token}`)
          .send({ name: 'Second App' })
          .then((res) => res.body.id),
      ]).then((createdApps) => {
        return request(server)
          .get(`/v1/companies/1/apps`)
          .set('Authorization', `Bearer ${token}`)
          .then((res) => {
            expect(res.status).toBe(200);
            const returnedApps = res.body.results.map((t) => t.id);
            expect(returnedApps).toContain(createdApps[0]);
            expect(returnedApps).toContain(createdApps[1]);
          });
      });
    });

    it('should require CAN_GET_API_CLIENT_APPS permission', () => {
      return request(server)
        .post('/v1/login')
        .send({
          email: 'companylevel@firstaccess.io',
          password: 'CompanyLevel123&',
        })
        .then((res1) => {
          return request(server)
            .get(`/v1/companies/1/apps`)
            .set('Authorization', `Bearer ${res1.body.token}`)
            .then((res2) => {
              expect(res2.status).toBe(403);
              expect(res2.body.message).toBe(
                'Forbidden due to insufficient permissions',
              );
            });
        });
    });

    it('should handle non-existent companies', () => {
      return request(server)
        .get(`/v1/companies/1000000/apps`)
        .set('Authorization', `Bearer ${token}`)
        .then((res) => {
          expect(res.status).toBe(404);
        });
    });
  });

  describe('DELETE /tokens/:tokenId', () => {
    it('should delete a client app', () => {
      return request(server)
        .post('/v1/companies/1/apps')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Temp App' })
        .then((created) => {
          return request(server)
            .delete(`/v1/apps/${created.body.id}`)
            .set('Authorization', `Bearer ${token}`)
            .then((res) => {
              expect(res.status).toBe(204);
            });
        });
    });

    it('should handle non-existent client app', () => {
      return request(server)
        .delete('/v1/apps/999999')
        .set('Authorization', `Bearer ${token}`)
        .then((res) => {
          expect(res.status).toBe(404);
        });
    });
  });
});
