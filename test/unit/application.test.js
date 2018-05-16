const applicationService = require('../../app/services/application');
const inProgressApplication = require('./data/inProgressApplication');

describe('Applications', () => {
  describe('Appraisal Submission', () => {
    it('Should return strucured scoring data', () => {
      const data = applicationService.structureScoringData(
        inProgressApplication,
        new Date(),
      );
      const record = data.Records[0];
      expect(record).toBeDefined();
      expect(record.version).toEqual('1.0.0');
      expect(record.decision.status).toEqual('pending');
      expect(record.id).toEqual(inProgressApplication.id);
      expect(record.branch.id).toEqual(inProgressApplication.user.branch.id);
      expect(record.workflow.id).toEqual(inProgressApplication.workflow.id);
      expect(record.user.id).toEqual(inProgressApplication.user.id);
      expect(record.product.id).toEqual(
        inProgressApplication.workflow.product.id,
      );

      /* eslint no-underscore-dangle: ["error", { "allow": ["_form"] }] */
      // The data to be submitted should be the stripped off the section names
      expect(record.data._form).toEqual({ name: 'Test Application' });
    });
  });
});
