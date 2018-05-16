exports.up = (knex) =>
  knex
    .raw('DELETE FROM members')
    .then(() =>
      knex.schema.table('members', (table) => {
        table.dropForeign('group_id');
        table.dropColumn('group_id');
      }),
    )
    .then(() => knex.raw('RENAME TABLE members TO applicants'))
    .then(() =>
      knex.schema.table('applicants', (table) => {
        table
          .bigInteger('application_id')
          .unsigned()
          .notNullable()
          .references('id')
          .inTable('applications')
          .onDelete('cascade');
        table.specificType('data', 'JSON').notNullable();
        table
          .boolean('eligible')
          .notNullable()
          .defaultTo(false);
        table
          .boolean('approved')
          .notNullable()
          .defaultTo(false);
      }),
    );

exports.down = (knex) =>
  knex
    .raw('DELETE FROM applicants')
    .then(() =>
      knex.schema.table('applicants', (table) => {
        table.dropForeign('application_id');
        table.dropColumn('application_id');
        table.dropColumn('eligible');
        table.dropColumn('approved');
        table.dropColumn('data');
      }),
    )
    .then(() => knex.raw('RENAME TABLE applicants TO members'))
    .then(() =>
      knex.schema.table('members', (table) => {
        table
          .bigInteger('group_id')
          .unsigned()
          .notNullable()
          .references('id')
          .inTable('groups');
      }),
    );
