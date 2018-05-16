exports.up = (knex) =>
  knex.schema
    .table('roles', (table) => {
      table.dropColumn('name');
    })
    .table('roles', (table) => {
      table.string('name').notNullable();
    });

exports.down = (knex) =>
  knex.schema
    .table('roles', (table) => {
      table.dropColumn('name');
    })
    .table('roles', (table) => {
      table.string('name').notNullable();
    });
