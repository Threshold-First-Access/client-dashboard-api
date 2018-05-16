const request = require('supertest');
const server = require('../../server');

describe('Compression', () => {
  afterAll(() => {
    server.close();
  });
  it('compresses responses', (done) => {
    request(server)
      .get('/v1/health')
      .end((err, res) => {
        expect(res.header['content-encoding']).toBe('gzip');
        done();
      });
  });
});
