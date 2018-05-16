module.exports = {
  id: '5c480315-e98d-4b88-b268-631299774cf0',
  completed: 0,
  eligible: 0,
  approved: 0,
  workflow_id: '41b6db1b-04b0-49b2-bda3-4c67dea8da47',
  user_id: 79,
  created_at: '2018-03-02T16:27:08.000Z',
  updated_at: '2018-03-02T16:29:39.000Z',
  scoring_response: null,
  test: 0,
  approval_at: null,
  deleted_at: null,
  submitted_at: null,
  data: {
    sections: {
      Bio: {
        name: 'Test Application',
      },
    },
  },
  decision: null,
  user: {
    id: 79,
    company_id: 9,
    first_name: 'John',
    last_name: 'Kariuki',
    email: 'john.kariuki+demok@firstaccessmarket.com',
    created_at: '2018-02-22T15:42:12.000Z',
    updated_at: '2018-02-22T15:43:36.000Z',
    active: 1,
    superadmin: 0,
    branch: {
      id: 1,
      name: 'Branch name',
    },
    activation_code: 'f32c8c20-17e6-11e8-b187-310274934325',
    profile_pic: null,
    test_mode_enabled: 0,
    expiry_at: '2018-02-23T15:42:12.000Z',
  },
  workflow: {
    id: '41b6db1b-04b0-49b2-bda3-4c67dea8da47',
    uuid: '9cf51336-992a-466f-9742-00458565646f',
    name: 'Kariuki',
    slug: 'kariuki',
    product_id: 14,
    created_at: '2018-03-02T13:05:33.000Z',
    updated_at: '2018-03-02T13:13:57.000Z',
    test_mode_enabled: 0,
    deleted_at: null,
    configuration_id: 'e2d922a3-e48b-49e8-a2aa-3cebc4eb107c',
    contract_id: 'c4c0d661-69eb-409a-b94b-0203fb0ff716',
    workflow_state_id: '43a27e09-66b7-4eb0-a762-54866e164649',
    product: {
      id: 14,
      name: 'Trading Business Loan',
      type: 'individual',
      company_id: 9,
      created_at: '2018-01-04T13:01:51.000Z',
      updated_at: '2018-01-22T17:51:54.000Z',
      active: 1,
      test_mode_enabled: 0,
      deleted_at: null,
    },
    configuration: {
      id: 'e2d922a3-e48b-49e8-a2aa-3cebc4eb107c',
      workflow_id: '41b6db1b-04b0-49b2-bda3-4c67dea8da47',
      schema: {
        schema: {
          sections: {
            Bio: {
              properties: {
                name: {
                  type: 'TextField',
                  placeholder: 'Something',
                },
              },
            },
          },
        },
      },
      created_at: '2018-03-02T13:12:17.000Z',
      updated_at: '2018-03-02T13:12:17.000Z',
    },
    analysisSchema: {},
  },
  branch: {
    id: 1,
    name: 'Branch name',
  },
};
