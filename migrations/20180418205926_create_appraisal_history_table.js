exports.up = (knex) =>
  knex.schema.createTableIfNotExists('appraisal_history', (table) => {
    table.uuid('id');
    table
      .uuid('appraisal_id')
      .references('id')
      .inTable('appraisals');
    table
      .boolean('eligible')
      .notNullable()
      .defaultTo(false);
    table
      .boolean('approved')
      .notNullable()
      .defaultTo(false);
    table.specificType('scoring_response', 'JSON').nullable();
    table.specificType('data', 'JSON').nullable();
    table.specificType('decision', 'JSON').nullable();
    table.enum('action', [
      'SUBMITTED',
      'REOPENED',
      'DELETED',
      'UPDATE_DECISION',
    ]);
    table
      .bigInteger('user_id')
      .unsigned()
      .references('id')
      .inTable('users');
    table.string('source_ip');
    table.string('comment');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTableIfExists('appraisal_history');
