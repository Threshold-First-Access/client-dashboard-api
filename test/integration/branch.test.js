const request = require('supertest');

const server = require('../../server');

const branchData = {
  name: 'Finca US',
};

let token;

describe('Branch Tests', () => {
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
          .end(() => {
            done();
          });
      });
  });

  afterAll(() => {
    server.close();
  });

  describe('Create branch', () => {
    it('it should create a branch for a valid company', (done) => {
      request(server)
        .post('/v1/companies/1/branches')
        .send(branchData)
        .set('token', token)
        .end((err, res) => {
          expect(res.body.name).toEqual(branchData.name);
          done();
        });
    });

    it('should return an error if the company does not exist', (done) => {
      request(server)
        .post('/v1/companies/254/branches')
        .send(branchData)
        .set('token', token)
        .end((err, res) => {
          expect(res.body.message).toEqual('Company does not exist');
          done();
        });
    });
  });

  describe('Get branches', () => {
    it('Should get all branches for a company', (done) => {
      request(server)
        .get('/v1/companies/1/branches')
        .set('token', token)
        .end((error, res) => {
          expect(res.body[0].name).toEqual('Finca US');
          done();
        });
    });
  });

  describe('Update branch', () => {
    const newBranch = {
      name: 'Branch 1',
    };
    const branchUpdate = {
      name: 'Branch 2',
    };
    let branch;
    beforeAll((done) => {
      request(server)
        .post('/v1/companies/1/branches')
        .send(newBranch)
        .set('token', token)
        .end((err, res) => {
          branch = res.body;
          done();
        });
    });

    it('should update a branch', (done) => {
      request(server)
        .patch(`/v1/branches/${branch.id}`)
        .send(branchUpdate)
        .set('token', token)
        .end((err, res) => {
          expect(res.body.name).toEqual(branchUpdate.name);
          done();
        });
    });

    it('should return an error if the update is not valid', (done) => {
      request(server)
        .patch(`/v1/branches/${branch.id}`)
        .send({})
        .set('token', token)
        .end((err, res) => {
          expect(res.status).toEqual(400);
          done();
        });
    });

    it('should return an error if the branch does not exist', (done) => {
      request(server)
        .patch('/v1/branches/200')
        .send(branchUpdate)
        .set('token', token)
        .end((err, res) => {
          expect(res.status).toEqual(404);
          done();
        });
    });
  });

  describe('Delete a branch', () => {
    let branch = null;

    beforeAll((done) => {
      request(server)
        .post('/v1/companies/1/branches')
        .send({ name: 'Test AddUserToBranch' })
        .set('token', token)
        .end((err, res) => {
          branch = res.body;
          done();
        });
    });

    it('returns an error if branch is invalid', (done) => {
      request(server)
        .del('/v1/branches/20')
        .set('token', token)
        .end((err, res) => {
          expect(res.body.message).toEqual('Branch does not exist');
          done();
        });
    });

    it('deletes a branch', (done) => {
      request(server)
        .del(`/v1/branches/${branch.id}`)
        .set('token', token)
        .end((err, res) => {
          expect(res.body.name).toEqual(branch.name);
          done();
        });
    });
  });
});
