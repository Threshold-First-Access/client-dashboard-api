exports.up = (knex) =>
  knex.schema.table('applicants', (table) => {
    table.specificType('decision', 'JSON').nullable();
  });

exports.down = (knex) =>
  knex.schema.table('applicants', (table) => {
    table.dropColumn('decision');
  });
