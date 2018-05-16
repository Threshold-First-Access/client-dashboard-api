exports.up = (knex) => {
  return knex.schema.createTableIfNotExists('request_log', (table) => {
    table.specificType('timestamp', 'TIMESTAMP(3)').notNullable(); // millisecond precision
    table.string('method').notNullable();
    table.string('path').notNullable();
    table.specificType('query', 'JSON');
    table.integer('status_code').notNullable();
    table.integer('duration_ms').notNullable();
    table.string('api_version').notNullable();
    table.string('ip').notNullable();
    table.string('user_agent').notNullable();
    table.string('company_id');
    table.string('auth_user_id');
    table.string('auth_type');
    table.string('auth_app_id');
    table.text('auth_token');
  });
};

exports.down = (knex) => {
  return knex.schema.dropTableIfExists('request_log');
};
