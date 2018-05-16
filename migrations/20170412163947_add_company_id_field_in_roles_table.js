exports.up = (knex) =>
  knex.schema.table('roles', (table) => {
    table
      .bigInteger('company_id')
      .unsigned()
      .references('id')
      .inTable('companies')
      .onDelete('cascade')
      .nullable();
  });

exports.down = (knex) =>
  knex.schema.table('roles', (table) => {
    table.dropForeign('company_id');
  });
