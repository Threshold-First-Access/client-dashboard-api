exports.up = (knex) =>
  knex.raw('DELETE FROM groups').then(() =>
    knex.schema.table('groups', (table) => {
      table
        .bigInteger('application_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('applications')
        .onDelete('cascade');
    }),
  );

exports.down = (knex) =>
  knex.schema.table('groups', (table) => {
    table.dropForeign('application_id');
    table.dropColumn('application_id');
  });
