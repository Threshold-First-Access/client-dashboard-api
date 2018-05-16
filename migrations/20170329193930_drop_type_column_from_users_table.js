exports.up = (knex) =>
  knex.schema.table('users', (table) => {
    table.dropColumn('type');
  });

exports.down = (knex) =>
  knex.schema.table('users', (table) => {
    table.enu('type', ['first_access', 'client']).notNullable();
  });
