exports.up = (knex) => knex.schema.renameTable('applications', 'appraisals');

exports.down = (knex) => knex.schema.renameTable('appraisals', 'applications');
