module.exports = {
  __timestamp: 1503948827.470051,
  __version: 'v1',
  data: [
    {
      description: '',
      name: 'Gender - Overview',
      type: 'report',
      options_url: {
        method: 'POST',
        url: '/reports/social-impact/gender/data-points',
      },
      report_url: {
        method: 'OPTIONS',
        url: '/reports/social-impact/gender/data-points',
      },
    },
    {
      long_description: 'Social Impact Metrics',
      name: 'Social Impact',
      type: 'category',
      reports: [
        {
          description: '',
          name: 'Gender - Overview',
          options_url: {
            method: 'POST',
            url: '/reports/social-impact/gender/data-points',
          },
          report_url: {
            method: 'OPTIONS',
            url: '/reports/social-impact/gender/data-points',
          },
        },
        {
          description: '',
          name: 'Gender - Overview',
          options_url: {
            method: 'POST',
            url: '/reports/social-impact/gender/over-time',
          },
          report_url: {
            method: 'OPTIONS',
            url: '/reports/social-impact/gender/over-time',
          },
        },
      ],
      short_description: 'Social Impact Metrics',
    },
    {
      long_description: 'Platform Usage Metrics',
      name: 'Platform Usage',
      reports: [],
      short_description: 'Platform Usage Metrics',
      type: 'category',
    },
  ],
};
