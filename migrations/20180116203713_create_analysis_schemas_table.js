exports.up = (knex) => {
  return knex.schema
    .createTableIfNotExists('analysis_schemas', (table) => {
      table.uuid('id').primary();
      table.text('content').notNullable();
      table.timestamps();
    })
    .then(() => {
      return knex.schema.alterTable('workflow_states', (table) => {
        table
          .uuid('analysis_schema_id')
          .nullable()
          .references('id')
          .inTable('analysis_schemas');
      });
    });
};

exports.down = (knex) => {
  return knex.schema
    .alterTable('workflow_states', (table) => {
      table.dropForeign('analysis_schema_id');
      table.dropColumn('analysis_schema_id');
    })
    .then(() => knex.schema.dropTableIfExists('analysis_schemas'));
};
