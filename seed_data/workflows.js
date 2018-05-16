const uuid = require('uuid/v4');

module.exports = (ids) => [
  {
    id: ids.workflows[0],
    uuid: uuid(),
    name: 'Existing Borrower',
    slug: 'existing-borrower',
    product_id: 1,
  },
  {
    id: ids.workflows[1],
    uuid: uuid(),
    name: 'Group Borrower',
    slug: 'group-borrower',
    product_id: 2,
  },
  {
    id: ids.workflows[2],
    uuid: uuid(),
    name: 'Test Workflow',
    slug: 'test-workflow',
    product_id: 2,
  },
  {
    id: ids.workflows[3],
    uuid: uuid(),
    name: 'Deleted Workflow',
    slug: 'deleted-workflow',
    product_id: 1,
  },
  {
    id: ids.workflows[4],
    uuid: uuid(),
    name: 'Second deleted Workflow',
    slug: 'deleted-workflow',
    product_id: 2,
    deleted_at: new Date(),
  },
  {
    id: ids.workflows[5],
    uuid: uuid(),
    name: 'Individual Borrower',
    slug: 'individual-borrower',
    product_id: 2,
  },
  {
    id: ids.workflows[6],
    uuid: uuid(),
    name: 'Workflow with numerical ID',
    slug: 'numerical-id-workflow',
    product_id: 1,
  },
];
