exports.up = (knex) =>
  knex.schema.table('applications', (t) => {
    t.specificType('data', 'JSON').nullable();
    t.specificType('decision', 'JSON').nullable();
  });

exports.down = (knex) =>
  knex.schema.table('applications', (t) => {
    t.dropColumn('data');
    t.dropColumn('decision');
  });
