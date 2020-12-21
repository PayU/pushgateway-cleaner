const { PUSHGATEWAY_URL, SLACK_WEBHOOK_URL } = process.env;
const { getMetricsGroups, getExpiredGroups, removeExpiredGroups } = require('./metrics');
const { notifySlack } = require('./notifier')
const logger = require('./logger')

const main = async () => {
    try {
        const groups = await getMetricsGroups(PUSHGATEWAY_URL);
        const rangeTimeForExpiredGroup = process.env['TTL_HOURS'] * 1000 * 60 * 60;
        const expiredGroups = getExpiredGroups(groups, rangeTimeForExpiredGroup);
        const urls = await removeExpiredGroups(expiredGroups, PUSHGATEWAY_URL);
        logger.info(`Removed ${urls.length} groups of metrics from pushgateway`);

        if (SLACK_WEBHOOK_URL) {
            await notifySlack(expiredGroups, SLACK_WEBHOOK_URL)
        }
    } catch(error) {
        logger.error(error.message);
    }
}

main();

require('../')
