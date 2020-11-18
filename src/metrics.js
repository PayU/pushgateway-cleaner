const axios = require('axios');
const logger = require('./logger');

const getMetricsGroups = async (pushGatewayUrl) => {
    const { data } = await axios.get(`${pushGatewayUrl}/api/v1/metrics`);
    if (data.status === 'success') {
        logger.info('Fetching metrics ends successfully');
        return data.data;
    } else {
        throw new Error('Fetching metrics failed');
    }
}

// This function classifies expired groups of metrics
const getExpiredGroups = (groups, ttl) => {
    let expiredGroups = [];
    groups.forEach(group => {
        const now = new Date().getTime();
        const lastPushTimestamp = group['push_time_seconds']['time_stamp'];
        const lastPushUnixTime = new Date(lastPushTimestamp).getTime();
        if (lastPushUnixTime < now - ttl) {
            // The group is out of range and therefore should remove from pushgateway
            expiredGroups.push(group['labels']);
            logger.info(`Found expired group with labels: ${JSON.stringify(group['labels'])}`);
        }
    })

    return expiredGroups;
}

// This function gets list of labels which represent a group of metrics
// Remove all groups using the Pushgateway API
const removeExpiredGroups = async (labelsList, pushgateway) => {
    let uris = [];

    labelsList.forEach(labels => {

        let uriStart = `job/${labels['job']}`;
        let uriEnd = '';
        for (const tag in labels) {
            if (tag && tag != 'job') {
                if (labels[tag] != '') {
                    uriStart += `/${tag}/${labels[tag]}`;
                } else {
                    uriEnd += `/${tag}//`;
                }
            }
        }
        let uri = `${uriStart}${uriEnd}`;
        logger.info(`push ${uri} to uris`);
        uris.push(uri);
    });

    let requests = uris.map(uri => axios.delete(`${pushgateway}/metrics/${uri}`)
        .then(response => logger.info(`DELETE url: ${response.config.url}: status code: ${response.status}`))
        .catch(error => logger.error(error.message)));
    
    await Promise.allSettled(requests);
    return uris;
}

module.exports = { getMetricsGroups, getExpiredGroups, removeExpiredGroups };