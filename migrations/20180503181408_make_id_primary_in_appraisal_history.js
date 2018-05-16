exports.up = (knex) =>
  knex.schema.alterTable('appraisal_history', (table) => {
    table
      .uuid('id')
      .notNullable()
      .primary()
      .alter();
  });

exports.down = (knex) =>
  knex.schema.alterTable('appraisal_history', (table) => {
    table.dropPrimary('id');
  });
