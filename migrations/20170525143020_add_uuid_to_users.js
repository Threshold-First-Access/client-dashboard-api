exports.up = (knex) =>
  knex.schema.table('users', (table) => {
    table.string('uuid').nullable();
  });

exports.down = (knex) =>
  knex.schema.table('users', (table) => {
    table.dropColumn('uuid');
  });
