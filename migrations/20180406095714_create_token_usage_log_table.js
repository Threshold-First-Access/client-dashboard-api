exports.up = (knex) =>
  knex.schema.createTableIfNotExists('token_usage_log', (table) => {
    table
      .bigincrements('id')
      .primary()
      .unsigned();
    table
      .bigInteger('token_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('tokens');
    table.string('last_6_token_chars', 6).notNullable();
    table.string('user_agent').notNullable();
    table.string('ip').notNullable();
    table.specificType('request', 'JSON').notNullable();
    table.timestamp('time').defaultTo(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTableIfExists('token_usage_log');
