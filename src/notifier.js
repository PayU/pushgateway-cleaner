const axios = require('axios');

const notifySlack = async (removedGroups, slackUrl) => {
    const notification = {
        "username": "Push Gateway Cleaner",
        "text": "<!here> Cleanup completed",
        "icon_emoji": ":bathtub:",
        "attachments": [{
            "color": "#ffcc00",
            "fields": [{
                "title": `${removedGroups.length} groups were deleted`,
                "value": removedGroups.join(',')
            }]
        }]
    };

    await axios.post(slackUrl, notification, {
        'Content-Type': 'application/json'
    });
}

module.exports = {notifySlack}
