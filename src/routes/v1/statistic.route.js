const express = require('express');
const validate = require('../../middlewares/validate');
const statisticValidation = require('../../validations/statistic.validation');
const statisticController = require('../../controllers/statistic.controller');

const router = express.Router();

router.route('/').get(validate(statisticValidation.getStatistics), statisticController.getStatistics);

module.exports = router;
