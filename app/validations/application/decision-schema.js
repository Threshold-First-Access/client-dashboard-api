module.exports = {
  oneOf: [
    {
      type: 'object',
      $ref: '#/definitions/approved',
    },
    {
      type: 'object',
      $ref: '#/definitions/denied',
    },
  ],
  definitions: {
    denied: {
      type: 'object',
      required: ['approved', 'rationale'],
      properties: {
        approved: {
          type: 'boolean',
          enum: [false],
        },
        rationale: {
          type: 'string',
        },
      },
    },
    approved: {
      type: 'object',
      required: ['approved', 'terms'],
      properties: {
        approved: {
          type: 'boolean',
          enum: [true],
        },
        rationale: {
          type: 'string',
        },
        terms: {
          $ref: '#/definitions/terms',
        },
      },
    },
    terms: {
      type: 'object',
      required: ['amount', 'interest_rate', 'tenor'],
      properties: {
        amount: {
          type: 'number',
          exclusiveMinimum: 0,
        },
        currency: {
          type: 'string',
          minLength: 3,
          maxLength: 3,
        },
        interest_rate: {
          type: 'number',
          exclusiveMinimum: 0,
        },
        tenor: {
          type: 'number',
          exclusiveMinimum: 0,
        },
      },
    },
  },
};
