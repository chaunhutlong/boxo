/* eslint-disable no-console */

const Agenda = require('agenda');
const config = require('../config/config');
const logger = require('../config/logger');
const { allDefinition } = require('./definitions/index');

const { processEvery } = config.agenda;

const agenda = new Agenda({
  db: {
    address: config.mongoose.url,
    options: { useNewUrlParser: true },
    collection: 'jobs',
  },
  useUnifiedTopology: true,
});

// Specifies the frequency at which agenda will query the database looking for jobs that need to be processed
agenda.processEvery(processEvery);

// listen for the ready or error event.
agenda.on('ready', () => logger.info('Agenda started!')).on('error', () => logger.error('Agenda connection error!'));

// Define agenda definitions
allDefinition(agenda, logger);

// Logs all registered jobs
console.log({ jobs: agenda._definitions });

module.exports = { agenda };
