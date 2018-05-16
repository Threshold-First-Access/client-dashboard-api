const request = require('supertest');
const omit = require('lodash/omit');
const pick = require('lodash/pick');
const assert = require('assert');

const server = require('../../server');
const ids = require('../../seeds/seed').ids;
const applications = require('../../seed_data/application');
const isSorted = require('../helpers/is-sorted');

describe('Loans', () => {
  let token;

  beforeAll((done) => {
    request(server)
      .post('/v1/login')
      .send({
        email: 'companylevel@firstaccess.io',
        password: 'CompanyLevel123&',
      })
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  afterAll(() => {
    server.close();
  });

  describe('Create an application', () => {
    it('Does not create a group application', (done) => {
      request(server)
        .post(`/v1/workflows/${ids.workflows[0]}/applications`)
        .send({ name: 'Redykyulass' })
        .set('token', token)
        .end((err, res) => {
          expect(res.body.message).toEqual(
            'Group appraisals not supported yet',
          );
          done();
        });
    });

    it('Creates an empty individual application', (done) => {
      request(server)
        .post(`/v1/workflows/${ids.workflows[5]}/applications`)
        .set('token', token)
        .end((err, res) => {
          expect(res.body.data).toEqual({});
          done();
        });
    });

    it('Creates an appraisal with initial data of the correct type', (done) => {
      request(server)
        .post(`/v1/workflows/${ids.workflows[5]}/applications`)
        .set('token', token)
        .send({
          data: {
            sections: {
              first_section: {
                previous_loan: false,
                applied_principal: 5000,
                name: 'Test Name',
              },
            },
          },
        })
        .end((err, res) => {
          expect(res.status).toEqual(201);
          expect(res.body).toBeDefined();
          expect(
            res.body.data.sections.first_section.applied_principal,
          ).toEqual(5000);
          done();
        });
    });

    it('SHould fail when string is passed in place of boolean', (done) => {
      request(server)
        .post(`/v1/workflows/${ids.workflows[5]}/applications`)
        .set('token', token)
        .send({
          data: {
            sections: {
              first_section: {
                previous_loan: 'invalidBool',
              },
            },
          },
        })
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(res.body.message).toBeDefined();
          expect(res.body.message.valid).toBeFalsy();
          expect(res.body.message.error.length).toBeGreaterThan(0);
          expect(res.body.message.error[0].errors[0]).toHaveProperty(
            'message',
            '"invalidBool" is not of type "boolean"',
          );
          done();
        });
    });

    it('Should fail when number is passed in place of string', (done) => {
      request(server)
        .post(`/v1/workflows/${ids.workflows[5]}/applications`)
        .set('token', token)
        .send({
          data: {
            sections: {
              first_section: {
                name: 50000,
              },
            },
          },
        })
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(res.body.message).toBeDefined();
          expect(res.body.message.valid).toBeFalsy();
          expect(res.body.message.error.length).toBeGreaterThan(0);
          expect(res.body.message.error[0].errors[0]).toHaveProperty(
            'message',
            '50000 is not of type "string"',
          );
          done();
        });
    });

    it('Should not create non test application if company is in test mode', (done) => {
      request(server)
        .post(`/v1/workflows/${ids.workflows[5]}/applications`)
        .set('token', token)
        .send({ test: false })
        .end((err, res) => {
          expect(res.status).toEqual(403);
          expect(res.body.message).toEqual(
            'Cannot create a non-test application because your company Finca is in test mode',
          );
          done();
        });
    });

    it('Returns an error if a workflow does not exist', (done) => {
      request(server)
        .post('/v1/workflows/110/applications')
        .set('token', token)
        .end((err, res) => {
          expect(res.status).toEqual(404);
          expect(res.body.message).toBe('Workflow does not exist');
          done();
        });
    });

    describe('Update application data', () => {
      it('Should update an application if data matches the configuration', (done) => {
        request(server)
          .patch(`/v1/applications/${ids.applications[0]}`)
          .set('token', token)
          .send({
            data: { sections: { first_section: { previous_loan: true } } },
          })
          .end((err, res) => {
            expect(res.status).toBe(200);
            expect(res.body.data).toBeDefined();
            expect(res.body.data.sections.first_section.previous_loan).toEqual(
              true,
            );
            expect(res.body.workflow.id).toEqual(ids.workflows[0]);
            expect(res.body.workflow.product.id).toEqual(1);
            done();
          });
      });

      it('Should fail to update application if data does not match configuration', (done) => {
        request(server)
          .patch(`/v1/applications/${ids.applications[0]}`)
          .set('token', token)
          .send({
            data: {
              sections: { first_section: { previous_loan: 'invalidBoolean' } },
            },
          })
          .end((err, res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toBeDefined();
            expect(res.body.message.valid).toBeFalsy();
            expect(res.body.message.error.length).toBeGreaterThan(0);
            expect(res.body.message.error[0].errors[0]).toHaveProperty(
              'instance',
              'invalidBoolean',
            );
            expect(res.body.message.error[0].errors[0]).toHaveProperty(
              'message',
              '"invalidBoolean" is not of type "boolean"',
            );
            done();
          });
      });

      it('fails if application is complete', (done) => {
        request(server)
          .patch(`/v1/applications/${ids.applications[1]}`)
          .set('token', token)
          .send({
            data: { sections: { first_section: { previous_loan: true } } },
          })
          .end((err, res) => {
            expect(res.status).toBe(400);
            done();
          });
      });

      it('Fails if application does not exist', (done) => {
        request(server)
          .patch('/v1/applications/20')
          .set('token', token)
          .send({
            data: { sections: { first_section: { previous_loan: true } } },
          })
          .end((err, res) => {
            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Application does not exist');
            done();
          });
      });
    });

    describe('Update application decision', () => {
      it('approves application', (done) => {
        request(server)
          .patch(`/v1/applications/${ids.applications[1]}`)
          .set('token', token)
          .send({
            decision: {
              approved: true,
              rationale: 'good business',
              terms: {
                amount: 10000,
                interest_rate: 0.15,
                tenor: 24,
              },
            },
          })
          .end((err, res) => {
            expect(res.status).toBe(200);
            expect(res.body.decision).toEqual({
              approved: true,
              rationale: 'good business',
              terms: {
                amount: 10000,
                interest_rate: 0.15,
                tenor: 24,
              },
            });
            done();
          });
      });

      it('denies application', (done) => {
        request(server)
          .patch(`/v1/applications/${ids.applications[1]}`)
          .set('token', token)
          .send({
            decision: {
              approved: false,
              rationale: 'high risk',
            },
          })
          .end((err, res) => {
            expect(res.status).toBe(200);
            expect(res.body.decision).toEqual({
              approved: false,
              rationale: 'high risk',
            });
            done();
          });
      });

      it('fails when application is not complete', (done) => {
        request(server)
          .patch(`/v1/applications/${ids.applications[3]}`)
          .set('token', token)
          .send({
            decision: {
              approved: false,
              rationale: 'high risk',
            },
          })
          .end((err, res) => {
            expect(res.status).toBe(403);
            expect(res.body.message).toEqual('Application is not complete yet');
            done();
          });
      });

      it('fails when the decision is an invalid approval', (done) => {
        request(server)
          .patch(`/v1/applications/${ids.applications[1]}`)
          .set('token', token)
          .send({
            decision: {
              approved: true,
            },
          })
          .end((err, res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toEqual('Invalid decision object');
            expect(res.body.errors).toContain(
              "decision should have required property 'terms'",
            );
            done();
          });
      });

      it('fails when the decision is an invalid approval', (done) => {
        request(server)
          .patch(`/v1/applications/${ids.applications[1]}`)
          .set('token', token)
          .send({
            decision: {
              approved: true,
              terms: {
                amount: 10000,
              },
            },
          })
          .end((err, res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toEqual('Invalid decision object');
            expect(res.body.errors).toContain(
              "decision.terms should have required property 'interest_rate'",
            );
            done();
          });
      });

      it('fails when the decision is an invalid denial', (done) => {
        request(server)
          .patch(`/v1/applications/${ids.applications[1]}`)
          .set('token', token)
          .send({
            decision: {
              approved: false,
            },
          })
          .end((err, res) => {
            expect(res.status).toBe(400);
            expect(res.body.message).toEqual('Invalid decision object');
            expect(res.body.errors).toContain(
              "decision should have required property 'rationale'",
            );
            done();
          });
      });

      it('fails if application does not exists', (done) => {
        request(server)
          .patch('/v1/applications/non-existent-application')
          .set('token', token)
          .send({
            decision: {
              approved: false,
            },
          })
          .end((err, res) => {
            expect(res.status).toEqual(404);
            expect(res.body.message).toEqual('Application does not exist');
            done();
          });
      });
    });

    describe('Clone an appraisal', () => {
      it('duplicates an appraisal', (done) => {
        const testApplicationId = ids.applications[2];
        const testApplication = applications(ids).find(
          (a) => a.id === testApplicationId,
        );
        const expectedClonedApplication = omit(testApplication, [
          'id',
          'created_at',
          'completed',
          'submitted_at',
        ]);
        const expectedApplicationKeys = Object.keys(expectedClonedApplication);

        expectedClonedApplication.data = JSON.parse(testApplication.data);

        request(server)
          .post(`/v1/applications/${testApplicationId}/clone`)
          .set('token', token)
          .end((err, res) => {
            expect(err).toBeNull();
            expect(expectedClonedApplication).toEqual(
              pick(res.body, expectedApplicationKeys),
            );

            done();
          });
      });

      it('does not duplicate in-progress appraisals', (done) => {
        request(server)
          .post(`/v1/applications/${ids.applications[3]}/clone`)
          .set('token', token)
          .end((err, res) => {
            expect(res.status).toBe(400);
            expect(res.body).toEqual({
              message: 'Cannot duplicate an in-progress appraisal.',
            });
            done();
          });
      });
    });
  });

  describe('Update test mode flag', () => {
    it('updates test mode flag for a draft appraisal', (done) => {
      request(server)
        .patch(`/v1/applications/${ids.applications[1]}`)
        .set('token', token)
        .send({
          test: true,
        })
        .end((err, res) => {
          expect(res.status).toBe(200);
          expect(res.body.test).toBe(true);
          done();
        });
    });
  });

  describe('List appraisals', () => {
    it('includes appraisals created by non-company users', (done) => {
      request(server)
        .get(`/v1/applications`)
        .query({ company_id: 1, sort_by: 'updated_at', sort_asc: true })
        .set('token', token)
        .end((err, res) => {
          expect(res.body.applications.map(({ id }) => id)).toContain(
            ids.applications[4],
          );
          done();
        });
    });

    it('should not include deleted appraisals by default', (done) => {
      request(server)
        .get(`/v1/applications`)
        .query({ company_id: 1, sort_by: 'name', sort_asc: true })
        .set('token', token)
        .end((err, res) => {
          const apps = res.body.applications;
          apps.forEach((app) => {
            assert(!app.deleted_at, `expected non-deleted appraisals only`);
          });
          done(err);
        });
    });

    it('includes soft-deleted workflows', (done) => {
      request(server)
        .get(`/v1/applications`)
        .query({ company_id: 1 })
        .set('token', token)
        .end((err, res) => {
          const apps = res.body.applications;
          apps.forEach((app) => {
            assert(
              app.workflow.product,
              `expected appraisals to have products`,
            );
          });
          done(err);
        });
    });

    it('sorts by date submitted in descending order', () => {
      return request(server)
        .get('/v1/applications')
        .query({
          sort_by: 'submitted_at',
          company_id: 1,
          completed: 1,
        })
        .set('token', token)
        .then((res) => {
          const submittedAtTimestamps = res.body.applications.map((app) => {
            return new Date(app.submitted_at).getTime();
          });
          const sorted = isSorted(submittedAtTimestamps, (a, b) => b - a);
          expect(submittedAtTimestamps.length).toBeGreaterThan(1);
          expect(sorted).toBe(true);
        });
    });

    it('sorts by date submitted in ascending order', () => {
      return request(server)
        .get('/v1/applications')
        .query({
          sort_by: 'submitted_at',
          company_id: 1,
          completed: 1,
          sort_asc: true,
        })
        .set('token', token)
        .then((res) => {
          const submittedAtTimestamps = res.body.applications.map((app) => {
            return new Date(app.submitted_at).getTime();
          });
          const sorted = isSorted(submittedAtTimestamps, (a, b) => a - b);
          expect(submittedAtTimestamps.length).toBeGreaterThan(1);
          expect(sorted).toBe(true);
        });
    });

    it('retrieves appraisals since date', () => {
      const sinceDate = new Date(Date.now() - 86400000);
      return request(server)
        .get('/v1/applications')
        .query({
          updated_since: sinceDate,
          company_id: 1,
          user_id: 2,
        })
        .set('token', token)
        .then((res) => {
          expect(res.ok).toBeTruthy();
          expect(res.body.applications.length).toBeGreaterThan(1);
          res.body.applications.forEach((application) => {
            expect(new Date(application.updated_at).getTime()).toBeGreaterThan(
              sinceDate.getTime(),
            );
          });
        });
    });

    it('should not accept invalid date', () => {
      return request(server)
        .get('/v1/applications')
        .query({
          updated_since: 'invalid date',
          company_id: 1,
          user_id: 2,
        })
        .set('token', token)
        .then((res) => {
          expect(res.ok).toBeTruthy();
          expect(res.body.applications.length).toBeGreaterThan(1);
        });
    });

    it('retrieves deleted appraisals when deleted flag is set to true', () => {
      return request(server)
        .get('/v1/applications')
        .query({
          company_id: 1,
          user_id: 2,
          deleted: true,
        })
        .set('token', token)
        .then((res) => {
          expect(res.ok).toBeTruthy();
          expect(res.body.applications.length).toBeGreaterThan(1);
          const deletedAppraisals = res.body.applications.filter(
            (application) => application.deleted_at,
          );
          expect(deletedAppraisals.length).toBeGreaterThan(0);
        });
    });

    it('does not retrieve deleted appraisals when deleted flag is not set', () => {
      return request(server)
        .get('/v1/applications')
        .query({
          company_id: 1,
          user_id: 2,
          deleted: false,
        })
        .set('token', token)
        .then((res) => {
          expect(res.ok).toBeTruthy();
          expect(res.body.applications.length).toBeGreaterThan(1);
          const deletedAppraisals = res.body.applications.filter(
            (application) => application.deleted_at,
          );
          expect(deletedAppraisals.length).toBe(0);
        });
    });

    it('falls back to page 1 when page < 1', () => {
      return request(server)
        .get('/v1/applications')
        .query({ company_id: 1, page: 0 })
        .set('token', token)
        .then((res) => {
          expect(res.body.page).toEqual(1);
        });
    });

    it('falls back to page size 500 when page size < 1', () => {
      return request(server)
        .get('/v1/applications')
        .query({ company_id: 1, page_size: 0 })
        .set('token', token)
        .then((res) => {
          expect(res.body.applications.length).toBeLessThanOrEqual(500);
        });
    });

    it('falls back to page size 500 when page size > 500', () => {
      return request(server)
        .get('/v1/applications')
        .query({ company_id: 1, page_size: 1000 })
        .set('token', token)
        .then((res) => {
          expect(res.body.applications.length).toBeLessThanOrEqual(500);
        });
    });

    // TODO: Add more tests for listing appraisals!!!!!!
  });

  describe('Get an a appraisal', () => {
    it('returns an appraisal created by non-company users', (done) => {
      request(server)
        .get(`/v1/applications/${ids.applications[4]}`)
        .set('token', token)
        .end((err, res) => {
          expect(res.status).toEqual(200);
          assert(res.body.workflow, `Workflow is returned for appraisal`);
          assert(
            res.body.workflow.product,
            `Product is returned for appraisal`,
          );
          assert(
            res.body.workflow.configuration,
            `Configuration is returned for appraisal`,
          );
          assert(
            res.body.workflow.analysisSchema,
            `Analysis Schema is returned for appraisal`,
          );
          done();
        });
    });

    it('returns an appraisal with a deleted workflow', (done) => {
      request(server)
        .get(`/v1/applications/${ids.applications[6]}`)
        .set('token', token)
        .end((err, res) => {
          expect(res.status).toEqual(200);
          expect(res.body.workflow.deleted_at !== null).toBeTruthy();
          done();
        });
    });

    it('returns a completed appraisal', (done) => {
      request(server)
        .get(`/v1/applications/${ids.applications[2]}`)
        .set('token', token)
        .end((err, res) => {
          expect(res.status).toEqual(200);
          expect(res.body.completed).toBeTruthy();
          done();
        });
    });

    it('Should not return a deleted appraisal', (done) => {
      request(server)
        .get(`/v1/applications/${ids.applications[7]}`)
        .set('token', token)
        .end((err, res) => {
          expect(res.status).toEqual(404);
          expect(res.body.message).toEqual('Application does not exist');
          done();
        });
    });
  });

  describe('Submit an appraisal', () => {
    it('Should fail validation when submitting data with missing required field', (done) => {
      // Application without required fields (name and applied principle)
      request(server)
        .post(`/v1/applications/${ids.applications[11]}/submit`)
        .set('token', token)
        .end((err, res) => {
          const errorMessage = res.body.message;
          expect(errorMessage.valid).toEqual(false);
          expect(errorMessage.error.length).toBeGreaterThan(0);
          expect(errorMessage.error[0].errors[0]).toHaveProperty(
            'name',
            'required',
          );
          expect(errorMessage.error[0].errors[0]).toHaveProperty(
            'property',
            'instance.name',
          );
          expect(errorMessage.error[0].errors[0]).toHaveProperty(
            'message',
            'This field is required.',
          );
          done();
        });
    });

    it('Should throw error when submitting a non-existent appraisal by ID', (done) => {
      request(server)
        .post('/v1/applications/non-existent-id/submit')
        .set('token', token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(404);
          expect(res.body.message).toEqual('Application does not exist');
          done();
        });
    });

    it('Should throw error when creating and submitting with non-existing workflow', (done) => {
      request(server)
        .post('/v1/applications/submit')
        .send({
          data: 'some data',
          workflow_id: 'non-existent-id',
        })
        .set('token', token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(404);
          expect(res.body.message).toEqual('Workflow does not exist');
          done();
        });
    });
  });

  describe('Delete an appraisal', () => {
    it('Should delete a draft appraisal', (done) => {
      request(server)
        .delete(`/v1/applications/${ids.applications[10]}`)
        .set('token', token)
        .end((err, res) => {
          expect(res.status).toEqual(204);
          done();
        });
    });

    it('Should throw error on deleting a completed appraisal', (done) => {
      request(server)
        .delete(`/v1/applications/${ids.applications[8]}`)
        .set('token', token)
        .end((err, res) => {
          expect(res.status).toEqual(403);
          expect(res.body.message).toEqual(
            'Submitted applications cannot be deleted',
          );
          done();
        });
    });
  });

  describe('Download appraisals', () => {
    const oneWeekAgo = new Date(Date.now() - 7 * 86400000);
    const now = new Date();

    it('should return appraisals created with the specified date range', () => {
      return request(server)
        .get('/v1/applications/download')
        .query({
          from: oneWeekAgo,
          to: now,
        })
        .set('Authorization', `Bearer ${token}`)
        .then((res) => {
          expect(res.body.length).toBeGreaterThan(1);
          res.body.forEach((appraisal) => {
            expect(new Date(appraisal.created_at).getTime()).toBeGreaterThan(
              oneWeekAgo.getTime(),
            );
            expect(new Date(appraisal.created_at).getTime()).toBeLessThan(
              now.getTime(),
            );
          });
        });
    });

    it('should return drafts', () => {
      return request(server)
        .get('/v1/applications/download')
        .query({
          from: oneWeekAgo,
          to: now,
          completed: 0,
        })
        .set('Authorization', `Bearer ${token}`)
        .then((res) => {
          expect(res.body.length).toBeGreaterThan(1);
          res.body.forEach((appraisal) => {
            expect(appraisal.submitted_at).toBeFalsy();
          });
        });
    });

    it('should return submitted appraisals', () => {
      return request(server)
        .get('/v1/applications/download')
        .query({
          from: oneWeekAgo,
          to: now,
          completed: 1,
        })
        .set('Authorization', `Bearer ${token}`)
        .then((res) => {
          expect(res.body.length).toBeGreaterThan(1);
          res.body.forEach((appraisal) => {
            expect(appraisal.submitted_at).toBeTruthy();
          });
        });
    });

    it('should validate date range', () => {
      return request(server)
        .get('/v1/applications/download')
        .query({
          from: 'not a date',
          to: 'also not a date',
        })
        .set('Authorization', `Bearer ${token}`)
        .then((res) => {
          expect(res.status).toBe(400);
        });
    });

    it('should return appraisals sorted by date created in descending order', () => {
      return request(server)
        .get('/v1/applications/download')
        .query({
          from: oneWeekAgo,
          to: now,
        })
        .set('Authorization', `Bearer ${token}`)
        .then((res) => {
          const timestamps = res.body.map((appraisal) => {
            return new Date(appraisal.created_at).getTime();
          });
          const sorted = isSorted(timestamps, (a, b) => b - a);
          expect(timestamps.length).toBeGreaterThan(1);
          expect(sorted).toBe(true);
        });
    });
  });
});
