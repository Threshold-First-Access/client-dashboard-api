exports.up = (knex) =>
  knex.schema.table('products', (table) => {
    table
      .boolean('test_mode_enabled')
      .notNullable()
      .defaultTo(false);
    table.unique(['company_id', 'name']);
  });

exports.down = (knex) =>
  knex.schema.table('products', (table) => {
    table.dropColumn('test_mode_enabled');
    table.dropForeign('company_id');
    table.dropUnique(['company_id', 'name']);
    table
      .foreign('company_id')
      .references('id')
      .inTable('companies');
  });
