exports.up = (knex) =>
  knex.schema
    .table('appraisals', (table) => {
      table
        .enum('state', ['DRAFT', 'SUBMITTED', 'REOPENED', 'CLOSED'])
        .defaultTo('DRAFT');
    })
    .then(() =>
      knex.raw(`UPDATE appraisals SET state='SUBMITTED' WHERE completed=1`),
    )
    .then(() =>
      knex.raw(
        `UPDATE appraisals SET state='CLOSED' WHERE deleted_at IS NOT NULL`,
      ),
    );

exports.down = (knex) =>
  knex.schema.table('appraisals', (table) => {
    table.dropColumn('state');
  });
