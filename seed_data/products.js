module.exports = [
  {
    id: 1,
    name: 'Product 1',
    type: 'group',
    company_id: 1,
    active: 1,
  },
  {
    id: 2,
    name: 'Product 2',
    type: 'Individual',
    company_id: 1,
    active: 1,
  },
  {
    id: 3,
    name: 'Product 3 - Deleted',
    type: 'Individual',
    company_id: 1,
    active: 1,
    deleted_at: new Date(),
  },
];
