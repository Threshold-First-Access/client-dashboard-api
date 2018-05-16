const request = require('supertest');
const server = require('../../server');

describe('Tokens', () => {
  let token;
  let userId;

  const decodeJwt = (jwt) => {
    const payloadBase64 = jwt.split('.')[1];
    const payload = new Buffer(payloadBase64, 'base64').toString();
    return JSON.parse(payload);
  };

  beforeAll(() => {
    return request(server)
      .post('/v1/login')
      .send({ email: 'test.user@fa.com', password: 'TestUser123&' })
      .then((res) => {
        token = res.body.token;
        userId = decodeJwt(token).id;
      });
  });

  afterAll(() => {
    server.close();
  });

  describe('POST /tokens', () => {
    it('should create a token', () => {
      return request(server)
        .post('/v1/tokens')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'First Token' })
        .then((res) => {
          expect(res.status).toBe(201);
          expect(res.body.token).toBeDefined();
        });
    });

    it('should handle description above max length', () => {
      return request(server)
        .post('/v1/tokens')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'word '.repeat(60) })
        .then((res) => {
          expect(res.status).toBe(400);
          expect(res.body.message).toContain(
            'length must be less than or equal to 255 characters',
          );
        });
    });

    it('should require CAN_CREATE_PERSONAL_ACCESS_TOKENS permission', () => {
      return request(server)
        .post('/v1/login')
        .send({
          email: 'companylevel@firstaccess.io',
          password: 'CompanyLevel123&',
        })
        .then((res1) => {
          return request(server)
            .post('/v1/tokens')
            .set('Authorization', `Bearer ${res1.body.token}`)
            .send({ description: 'Second Token' })
            .then((res2) => {
              expect(res2.status).toBe(403);
              expect(res2.body.message).toBe(
                'Forbidden due to insufficient permissions',
              );
            });
        });
    });

    it('should not create a token if authenticated with a personal access token', () => {
      return request(server)
        .post('/v1/tokens')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'New Token' })
        .then((created) => {
          return request(server)
            .post('/v1/tokens')
            .set('Authorization', `Bearer ${created.body.token}`)
            .send({ description: 'Newer Token' })
            .then((res) => {
              expect(res.status).toBe(403);
              expect(res.body.message).toBe(
                'Cannot create a personal access token when authenticated with a personal access token.',
              );
            });
        });
    });
  });

  describe('GET /users/:userId/tokens', () => {
    it('should return previously created tokens', () => {
      return Promise.all([
        request(server)
          .post('/v1/tokens')
          .set('Authorization', `Bearer ${token}`)
          .send({ description: 'Token 3' })
          .then((res) => res.body.id),
        request(server)
          .post('/v1/tokens')
          .set('Authorization', `Bearer ${token}`)
          .send({ description: 'Token 4' })
          .then((res) => res.body.id),
      ]).then((createdTokens) => {
        return request(server)
          .get(`/v1/users/${userId}/tokens`)
          .set('Authorization', `Bearer ${token}`)
          .then((res) => {
            expect(res.status).toBe(200);
            const returnedTokens = res.body.results.map((t) => t.id);
            expect(returnedTokens).toContain(createdTokens[0]);
            expect(returnedTokens).toContain(createdTokens[1]);
          });
      });
    });

    it('should not include the actual token', () => {
      return Promise.all([
        request(server)
          .post('/v1/tokens')
          .set('Authorization', `Bearer ${token}`)
          .send({ description: 'Token 7' })
          .then((res) => res.body.id),
        request(server)
          .post('/v1/tokens')
          .set('Authorization', `Bearer ${token}`)
          .send({ description: 'Token 8' })
          .then((res) => res.body.id),
      ]).then(() => {
        return request(server)
          .get(`/v1/users/${userId}/tokens`)
          .set('Authorization', `Bearer ${token}`)
          .then((res) => {
            expect(res.status).toBe(200);
            res.body.results.forEach((result) => {
              expect(result.token).toBeUndefined();
            });
          });
      });
    });

    it("should not allow users to get other user's tokens", () => {
      return request(server)
        .post('/v1/login')
        .send({
          email: 'companylevel@firstaccess.io',
          password: 'CompanyLevel123&',
        })
        .then((res1) => {
          return request(server)
            .get(`/v1/users/${userId}/tokens`)
            .set('Authorization', `Bearer ${res1.body.token}`)
            .then((res2) => {
              expect(res2.status).toBe(403);
              expect(res2.body.message).toBe(
                'Access denied. You can only get your own tokens.',
              );
            });
        });
    });

    it("should allow superadmins to get other users' tokens", () => {
      return request(server)
        .post('/v1/login')
        .send({
          email: 'admin@firstaccess.com',
          password: 'SuperAdmin123&',
        })
        .then((res1) => {
          return request(server)
            .get(`/v1/users/${userId}/tokens`)
            .set('Authorization', `Bearer ${res1.body.token}`)
            .then((res2) => {
              expect(res2.status).toBe(200);
            });
        });
    });
  });

  describe('DELETE /tokens/:tokenId', () => {
    it('should delete a token', () => {
      return request(server)
        .post('/v1/tokens')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Third Token' })
        .then((created) => {
          return request(server)
            .delete(`/v1/tokens/${created.body.id}`)
            .set('Authorization', `Bearer ${token}`)
            .then((res) => {
              expect(res.status).toBe(204);
            });
        });
    });

    it('should handle non-existent token', () => {
      return request(server)
        .delete('/v1/tokens/999999')
        .set('Authorization', `Bearer ${token}`)
        .then((res) => {
          expect(res.status).toBe(404);
        });
    });

    it('should only allow access to owner and superadmins', () => {
      return Promise.all([
        request(server)
          .post('/v1/tokens')
          .set('Authorization', `Bearer ${token}`)
          .send({ description: 'Fourth Token' })
          .then((res) => res.body.id),
        request(server)
          .post('/v1/login')
          .send({
            email: 'companylevel@firstaccess.io',
            password: 'CompanyLevel123&',
          })
          .then((res) => res.body.token),
      ]).then(([personalAccessTokenId, jwtToken]) => {
        return request(server)
          .delete(`/v1/tokens/${personalAccessTokenId}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .then((res) => {
            expect(res.status).toBe(404);
          });
      });
    });
  });
});
