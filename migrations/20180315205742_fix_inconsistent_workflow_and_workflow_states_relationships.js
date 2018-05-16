/* Each workflow should have at least on workflow_state without an
end date to serve as the active workflow state. However, this is
not always the case due to a bug that was fixed by PR #235. For such cases,
this migration takes the most recent workflow state and sets it's end_date to
NULL to make it the active workflow state for that workflow
*/
const logger = require('../app/logger');

exports.up = (knex) => {
  return knex
    .raw(
      `UPDATE workflow_states ws1
      JOIN (
      	SELECT st.workflow_id, max(st.end_date) AS end_date FROM workflows wo
      	JOIN workflow_states st ON wo.id = st.workflow_id
      	WHERE wo.id NOT IN (
      		SELECT w.id FROM workflows w
      		JOIN workflow_states s ON w.id = s.workflow_id
      		WHERE s.end_date IS NULL
      	)
      	GROUP BY st.workflow_id
      ) as ws2
      ON ws1.workflow_id = ws2.workflow_id
      SET ws1.end_date = NULL
      WHERE ws1.workflow_id = ws2.workflow_id AND ws1.end_date = ws2.end_date`,
    )
    .then((res) => {
      logger.debug(
        `Fixed workflow state inconsistencies: ${JSON.stringify(res)}`,
      );
    });
};

exports.down = () => {};
