exports.up = (knex) =>
  knex.schema.table('applications', (table) => {
    table
      .uuid('workflow_state_id')
      .references('id')
      .inTable('workflow_states')
      .nullable();
  });

exports.down = (knex) =>
  knex.schema.table('applications', (table) => {
    table.dropForeign('workflow_state_id');
    table.dropColumn('workflow_state_id');
  });
