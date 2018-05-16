exports.up = (knex) =>
  knex.schema.table('workflows', (t) => {
    t
      .uuid('configuration_id')
      .nullable()
      .references('id')
      .inTable('configurations');
    t
      .uuid('contract_id')
      .nullable()
      .references('id')
      .inTable('contracts');
    t
      .uuid('workflow_state_id')
      .nullable()
      .references('id')
      .inTable('workflow_states');
  });

exports.down = (knex) =>
  knex.schema.table('workflows', (t) => {
    t.dropForeign('configuration_id');
    t.dropForeign('contract_id');
    t.dropForeign('workflow_state_id');

    t.dropColumn('configuration_id');
    t.dropColumn('contract_id');
    t.dropColumn('workflow_state_id');
  });
