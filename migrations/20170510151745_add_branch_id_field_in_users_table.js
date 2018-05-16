exports.up = (knex) =>
  knex.schema.table('users', (table) => {
    table
      .bigInteger('branch_id')
      .unsigned()
      .references('id')
      .inTable('branches');
  });

exports.down = (knex) =>
  knex.schema.table('users', (table) => {
    table.dropForeign('branch_id');
  });
