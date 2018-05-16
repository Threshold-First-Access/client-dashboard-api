exports.up = (knex) => {
  return knex.schema.createTableIfNotExists('configurations', (table) => {
    table
      .bigincrements('id')
      .primary()
      .unsigned();
    table
      .bigInteger('workflow_id')
      .unsigned()
      .references('id')
      .inTable('workflows');
    table.text('schema').notNullable();
    table.timestamps();
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('configurations');
};
