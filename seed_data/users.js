module.exports = [
  /**
   * Login credentials for App user
   *
   * email: applevel@firstaccess.io
   * password: AppLevel123&
   */
  {
    id: 1,
    first_name: 'App',
    last_name: 'Level',
    active: 1,
    email: 'applevel@firstaccess.io',
    password: '$2a$10$9SryHnY48QYVrR2uq.c6Jensl25Ab47rWEuBQWIkuS94PsL3k.My6',
    superadmin: 0,
  },

  /**
   * Login credentials for Company level user
   *
   * email: companylevel@firstaccess.io
   * password: CompanyLevel123&
   */
  {
    id: 2,
    company_id: 1,
    first_name: 'Company',
    last_name: 'Level',
    active: 1,
    email: 'companylevel@firstaccess.io',
    password: '$2a$10$D.7xHWiUDIqvm.LVerowROWb6TFKBWqh6gRLclTO7I/cr6ONrsaeS',
    activation_code: '123',
    superadmin: 0,
  },
  {
    id: 3,
    company_id: 1,
    first_name: 'Mwalimu',
    last_name: 'Nyerere',
    active: 0,
    email: 'nyerere@firstaccess.io',
    password: '$2a$10$D.7xHWiUDIqvm.LVerowROWb6TFKBWqh6gRLclTO7I/cr6ONrsaeS',
    activation_code: '1234',
    superadmin: 0,
    expiry_at: new Date(Date.now() + 86400000),
  },
];
