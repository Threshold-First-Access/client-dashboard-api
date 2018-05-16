exports.up = (knex) =>
  knex.raw('DELETE FROM applications').then(() =>
    knex.schema.table('applications', (table) => {
      table.dropColumn('data');
      table.dropForeign('group_id');
      table.dropColumn('group_id');
    }),
  );

exports.down = (knex) =>
  knex.schema.table('applications', (table) => {
    table.specificType('data', 'JSON').notNullable();
    table
      .bigInteger('group_id')
      .unsigned()
      .references('id')
      .inTable('groups');
  });
