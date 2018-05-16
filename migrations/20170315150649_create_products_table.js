exports.up = (knex) =>
  knex.schema.createTableIfNotExists('products', (table) => {
    table
      .bigincrements('id')
      .primary()
      .unsigned();
    table.string('name').notNullable();
    table.enu('type', ['individual', 'group']).notNullable();
    table
      .bigInteger('company_id')
      .unsigned()
      .references('id')
      .inTable('companies');
    table
      .enu('active', [0, 1])
      .notNullable()
      .defaultTo(0);
    table.timestamps();
  });

exports.down = (knex) => knex.schema.dropTableIfExists('products');
