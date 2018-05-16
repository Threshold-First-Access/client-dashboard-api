exports.up = (knex) =>
  knex.schema.table('applications', (table) => {
    table
      .bigInteger('group_id')
      .unsigned()
      .references('id')
      .inTable('groups');
  });

exports.down = (knex) =>
  knex.schema.table('applications', (table) => {
    table.dropForeign('group_id');
  });
