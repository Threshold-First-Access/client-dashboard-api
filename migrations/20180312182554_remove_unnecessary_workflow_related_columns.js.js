exports.up = (knex) => {
  return knex.schema
    .alterTable('workflows', (table) => {
      table.dropForeign('workflow_state_id');
      table.dropColumn('workflow_state_id');
      table.dropForeign('contract_id');
      table.dropColumn('contract_id');
      table.dropForeign('configuration_id');
      table.dropColumn('configuration_id');
    })
    .then(() => {
      return knex.schema.alterTable('contracts', (table) => {
        table.dropForeign('workflow_id');
        table.dropColumn('workflow_id');
      });
    })
    .then(() => {
      return knex.schema.alterTable('configurations', (table) => {
        table.dropForeign('workflow_id');
        table.dropColumn('workflow_id');
      });
    });
};

exports.down = (knex) => {
  return knex.schema
    .alterTable('workflows', (table) => {
      table
        .uuid('workflow_state_id')
        .nullable()
        .references('id')
        .inTable('workflow_states');
      table
        .uuid('contract_id')
        .nullable()
        .references('id')
        .inTable('contracts');
      table
        .uuid('configuration_id')
        .nullable()
        .references('id')
        .inTable('configurations');
    })
    .then(() => {
      return knex.schema.alterTable('contracts', (table) => {
        table
          .uuid('workflow_id')
          .nullable()
          .references('id')
          .inTable('workflows');
      });
    })
    .then(() => {
      return knex.schema.alterTable('configurations', (table) => {
        table
          .uuid('workflow_id')
          .nullable()
          .references('id')
          .inTable('workflows');
      });
    })
    .then(() => {
      // When we are readding the columns we also need to repopulate them
      // with the data they had before they were deleted.
      return knex.raw(`
        UPDATE workflows
          LEFT OUTER JOIN workflow_states ON workflows.id = workflow_states.workflow_id AND workflow_states.end_date IS NULL
          LEFT OUTER JOIN configurations ON workflow_states.configuration_id = configurations.id
          LEFT OUTER JOIN contracts ON workflow_states.contract_id = contracts.id
        SET workflows.workflow_state_id = workflow_states.id,
          workflows.configuration_id = configurations.id,
          workflows.contract_id = contracts.id
      `);
    })
    .then(() => {
      return knex.raw(`
        UPDATE contracts
          JOIN workflow_states ON contracts.id = workflow_states.contract_id
        SET contracts.workflow_id = workflow_states.workflow_id
      `);
    })
    .then(() => {
      return knex.raw(`
        UPDATE configurations
          JOIN workflow_states ON configurations.id = workflow_states.configuration_id
        SET configurations.workflow_id = workflow_states.workflow_id
      `);
    });
};
