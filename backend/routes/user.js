const router = require('express-promise-router')();
const { dashboard } = require('../controllers/users/dashboard');
const { submitAccountType } = require('../controllers/users/submitAccType');
const { submitNormalBackground, submitExpertBackground } = require('../controllers/users/submitBackground');
const { checkJwt } = require('../controllers/auth/register');

router.route('/dashboard').get(checkJwt, dashboard);
router.route('/account-type').post(checkJwt, submitAccountType);
router.route('/normal-background').post(checkJwt, submitNormalBackground);
router.route('/expert-background').post(checkJwt, submitExpertBackground);

module.exports = router;
