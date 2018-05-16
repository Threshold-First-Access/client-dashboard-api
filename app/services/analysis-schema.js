const errors = require('../errors');
const WorkflowState = require('../models/workflow_state');
const AnalysisSchema = require('../models/analysis-schema');
const bookshelf = require('../bookshelf');
const WorkflowService = require('./workflow');

class AnalysisSchemaService {
  update(req) {
    const workflowId = req.params.workflow_id;
    const userId = req.user.id;
    return bookshelf.transaction((trx) => {
      return new AnalysisSchema()
        .save(
          { content: req.body.content },
          { transacting: trx, user_id: userId },
        )
        .then((analysisSchema) => {
          return WorkflowService.updateWorkflowState(
            workflowId,
            { analysisSchemaId: analysisSchema.get('id') },
            { userId, trx },
          ).then(() => analysisSchema);
        });
    });
  }

  get(req) {
    const workflowId = req.params.workflow_id;
    return new WorkflowState()
      .where({ workflow_id: workflowId, end_date: null })
      .fetch({ withRelated: 'analysisSchema' })
      .then((workflowState) => {
        /* Every workflow should have a workflow state whose `end_date` is null
        So if no such workflow state exists for a certain workflow id,
        we can conclude that there's no workflow with that id. */
        if (!workflowState) {
          throw new errors.WorkflowNotFound('Workflow not found.');
        }

        const analysisSchema = workflowState.related('analysisSchema');

        if (analysisSchema.isNew()) {
          throw new errors.AnalysisSchemaNotFound(
            'This workflow does not have an analysis schema.',
          );
        }

        return analysisSchema;
      });
  }
}

module.exports = new AnalysisSchemaService();
