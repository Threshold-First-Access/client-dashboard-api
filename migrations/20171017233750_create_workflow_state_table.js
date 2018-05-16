exports.up = (knex) =>
  knex.schema.createTableIfNotExists('workflow_states', (table) => {
    table
      .uuid('id')
      .primary()
      .unique();
    table
      .uuid('workflow_id')
      .references('id')
      .inTable('workflows');
    table
      .uuid('contract_id')
      .references('id')
      .inTable('contracts');
    table
      .uuid('configuration_id')
      .references('id')
      .inTable('configurations');
    table.dateTime('start_date').defaultTo(knex.fn.now());
    table
      .dateTime('end_date')
      .nullable()
      .defaultTo(null);
    table.timestamps();
  });

exports.down = (knex) => knex.schema.dropTableIfExists('workflow_states');
