exports.up = (knex) =>
  knex.schema.createTableIfNotExists('applications', (table) => {
    table
      .bigincrements('id')
      .primary()
      .unsigned();
    table.specificType('data', 'JSON').notNullable();
    table
      .boolean('completed')
      .notNullable()
      .defaultTo(false);
    table
      .boolean('eligible')
      .notNullable()
      .defaultTo(false);
    table
      .boolean('approved')
      .notNullable()
      .defaultTo(false);
    table
      .bigInteger('workflow_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('workflows');
    table
      .bigInteger('user_id')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('cascade')
      .notNullable();
    table.timestamps();
  });

exports.down = (knex) => knex.schema.dropTableIfExists('applications');
