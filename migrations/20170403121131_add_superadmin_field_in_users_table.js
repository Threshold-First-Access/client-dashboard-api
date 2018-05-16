exports.up = (knex) =>
  knex.schema.table('users', (table) => {
    table.boolean('superadmin').defaultTo(false);
  });

exports.down = (knex) =>
  knex.schema.table('users', (table) => {
    table.dropColumn('superadmin');
  });
