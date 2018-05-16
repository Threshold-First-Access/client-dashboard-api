const roles = require('../seed_data/role');
const companies = require('../seed_data/companies');
const users = require('../seed_data/users');
const permissions = require('../seed_data/permissions');
const rolesUsers = require('../seed_data/roles_users');
const products = require('../seed_data/products');
const workflows = require('../seed_data/workflows');
const states = require('../seed_data/states');
const configs = require('../seed_data/configurations');
const contracts = require('../seed_data/contracts');
const analysisSchemas = require('../seed_data/analys_schemas');
const applications = require('../seed_data/application');
const passwordResets = require('../seed_data/password_reset');
const tokens = require('../seed_data/tokens');

const ids = {
  workflows: [
    '6fe4547f-7d8b-4448-a9f7-bfc81e7f4010',
    'b33c0da6-93e1-4f8f-acda-4f85a6d433ec',
    'd42abaaf-9a53-4e15-89c0-f74f52193a06',
    'c0fe878e-474e-4afa-a37d-6183f048a5a4',
    '0f290e48-c8b1-4e9d-9642-385f66da3548',
    'd584b4da-6789-435f-8347-c658c561f953',
    9,
  ],
  states: [
    'deb57cd9-f21d-4736-bfd9-4915515b957d',
    '9136b931-2580-40b6-ad96-9c52052ce465',
    'a819ea91-1531-456e-8f87-e78d6ac9ad1c',
    '8ef44c98-b8bc-45bb-a5cd-a5c5462e8f55',
    '7b94d992-62cd-4314-b966-00fb42c06289',
    '8d782de9-75af-4e7a-a26f-f00dac2135d0',
    'c0f0c88d-d562-4835-9227-7874f278b4c1',
  ],
  applications: [
    '1b374a2f-a788-46f5-825e-7bdf3e8dbad5',
    'd764a78b-0f43-47bf-bb08-0e9177efb794',
    'b37f67d4-ecea-48ec-b7e3-68fa77aadd64',
    'db5162a1-7bca-414e-92fc-ba2c1aabc9ef',
    'ad5853cf-947c-4a8f-a291-04f848522ee9',
    'adf91b50-1eb4-47d8-a8a3-924ecab9d216',
    '842f2916-a13e-488f-81bc-db0e8dd18579',
    'dc587faa-85d4-46cf-948d-bc61422ee2d5',
    'a59e28c8-2cfa-4abe-90a1-92477a48bc75',
    '6fab3463-a6bc-4dfc-acac-89e20eeca0fa',
    '60b9ad83-5708-453d-b08f-8e4d64dc6b0f',
    'fd6b5111-c18b-4fbe-8032-fca24fcae62c',
    'e6ee150e-30f9-4f5c-8371-1bbc5ba87b73',
  ],
  configurations: [
    '6189d188-1458-419d-8ce7-486502ddf36e',
    '5a72f84d-bf51-4285-bf72-56a046a80249',
    '79d3f273-0ee2-4395-be15-814a501968d1',
    '9df91753-aa33-4e38-97f4-939542c66a5c',
    'ed46d555-4630-466d-9661-21042515b2ea',
    'b12bb146-061c-4260-bf6b-394b83d0a8dd',
    'e6b83195-149c-428c-af9b-b4e65b37860c',
  ],
  contracts: [
    '7c693fed-c6a9-4d98-9714-e206788f26c4',
    '35e0a02e-990a-43cb-ade1-8815db2e5ced',
  ],
  analysisSchemas: ['43bc93ba-45e3-48a3-b726-83009b300e07'],
};

exports.ids = ids;
exports.seed = (knex) => {
  return knex('companies')
    .insert(companies)
    .then(() => knex('roles').insert(roles))
    .then(() => knex('permissions').insert(permissions))
    .then(() => knex('users').insert(users))
    .then(() => knex('password_reset_requests').insert(passwordResets))
    .then(() => knex('roles_users').insert(rolesUsers))
    .then(() => knex('products').insert(products))
    .then(() => knex('configurations').insert(configs(ids)))
    .then(() => knex('contracts').insert(contracts(ids)))
    .then(() => knex('analysis_schemas').insert(analysisSchemas(ids)))
    .then(() => knex('workflows').insert(workflows(ids)))
    .then(() => knex('workflow_states').insert(states(ids)))
    .then(() => knex('appraisals').insert(applications(ids)))
    .then(() => knex('tokens').insert(tokens()));
};
