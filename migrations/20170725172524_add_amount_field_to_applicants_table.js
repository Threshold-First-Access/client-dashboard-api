exports.up = (knex) =>
  knex.schema.table('applicants', (table) => {
    table.string('currency').notNullable();
    table.bigInteger('amount').notNullable();
  });

exports.down = (knex) =>
  knex.schema.table('applicants', (table) => {
    table.dropColumn('currency');
    table.dropColumn('amount');
  });
