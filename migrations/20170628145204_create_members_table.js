exports.up = (knex) =>
  knex.schema.createTableIfNotExists('members', (table) => {
    table
      .bigincrements('id')
      .primary()
      .unsigned();
    table.string('name').notNullable();
    table
      .bigInteger('group_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('groups');
    table.timestamps();
  });

exports.down = (knex) => knex.schema.dropTableIfExists('members');
