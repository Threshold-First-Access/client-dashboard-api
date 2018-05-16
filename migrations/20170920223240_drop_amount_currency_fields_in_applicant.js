exports.up = (knex) =>
  knex.schema.table('applicants', (table) => {
    table.dropColumn('amount');
    table.dropColumn('currency');
  });

exports.down = (knex) =>
  knex.schema.table('applicants', (table) => {
    table.string('currency').notNullable();
    table.bigInteger('amount').notNullable();
  });
