exports.up = (knex) => {
  return knex.schema.createTableIfNotExists('contracts', (table) => {
    table.charset('utf8mb4');
    table
      .bigincrements('id')
      .primary()
      .unsigned();
    table
      .bigInteger('workflow_id')
      .unsigned()
      .references('id')
      .inTable('workflows');
    table.text('content').notNullable();
    table.timestamps();
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('contracts');
};
