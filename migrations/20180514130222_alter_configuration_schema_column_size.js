exports.up = (knex) => {
  return knex.schema
    .alterTable('configurations', (table) => {
      table.text('schema', 'longtext').alter();
    })
    .then(() => {
      return knex.schema.alterTable('transaction_audit', (table) => {
        table.text('data', 'longtext').alter();
      });
    })
    .then(() => {
      return knex.schema.alterTable('contracts', (table) => {
        table.text('content', 'longtext').alter();
      });
    })
    .then(() => {
      return knex.schema.alterTable('analysis_schemas', (table) => {
        table.text('content', 'longtext').alter();
      });
    });
};

exports.down = (knex) => {
  return knex.schema
    .alterTable('configurations', (table) => {
      table.text('schema').alter();
    })
    .then(() => {
      return knex.schema.alterTable('transaction_audit', (table) => {
        table.text('data').alter();
      });
    })
    .then(() => {
      return knex.schema.alterTable('contracts', (table) => {
        table.text('content').alter();
      });
    })
    .then(() => {
      return knex.schema.alterTable('analysis_schemas', (table) => {
        table.text('content').alter();
      });
    });
};
