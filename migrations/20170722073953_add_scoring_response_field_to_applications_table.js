exports.up = (knex) =>
  knex.schema.table('applications', (table) => {
    table.specificType('scoring_response', 'JSON').nullable();
  });

exports.down = (knex) =>
  knex.schema.table('applications', (table) => {
    table.dropColumn('scoring_response');
  });
