exports.up = (knex) =>
  knex.schema.createTableIfNotExists('company_apps', (table) => {
    table.uuid('id').primary();
    table
      .bigInteger('company_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('companies');
    table.string('name').notNullable();
    table.string('description').nullable();
    table.string('access_key').notNullable();
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });

exports.down = (knex) => knex.schema.dropTableIfExists('company_apps');
