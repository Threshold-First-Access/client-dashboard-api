exports.up = (knex) =>
  knex.schema.table('permissions', (table) => {
    table.string('category').nullable();
  });

exports.down = (knex) =>
  knex.schema.table('permissions', (table) => {
    table.dropColumn('category');
  });
