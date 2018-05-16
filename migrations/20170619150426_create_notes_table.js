exports.up = (knex) => {
  return knex.schema.createTableIfNotExists('notes', (table) => {
    table
      .bigincrements('id')
      .primary()
      .unsigned();
    table.text('content').notNullable();
    table
      .bigInteger('application_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('applications');
    table.timestamps();
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('notes');
};
