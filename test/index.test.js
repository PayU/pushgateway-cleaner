const nock = require('nock');
const { expect } = require('chai');
const logger = require('../src/logger');
const { PUSHGATEWAY_URL } = process.env;
const { getMetricsGroups, getExpiredGroups, removeExpiredGroups } = require('../src/metrics');
const { notifySlack } = require('../src/notifier');

const hoursInMilisec = 1*60*60*1000;
const now = new Date();
const hourAgo = new Date(now.getTime() - hoursInMilisec);
const twoHoursAgo = new Date(hourAgo.getTime() - hoursInMilisec);
const threeHoursAgo = new Date(twoHoursAgo.getTime() - hoursInMilisec);

const successBody = {
    status: 'success',
    data: [
        {
            labels: {
                job: 'jobby',
                instance: 'bobby',
            },
            push_time_seconds: {
                time_stamp: now.toString(),
            }
        },
        {
            labels: {
                job: 'hell_yeah',
                instance: 'saywhat',
            },
            push_time_seconds: {
                time_stamp: hourAgo.toString(),
            }
        },
        {
            labels: {
                job: 'hell_yeah',
                app_name: 'got-ya',
            },
            push_time_seconds: {
                time_stamp: twoHoursAgo.toString(),
            }
        },
        {
            labels: {
                job: 'hell_yeah',
                app_name: '',
                instance: 'saywhat'
            },
            push_time_seconds: {
                time_stamp: threeHoursAgo.toString(),
            }
        }
    ]
}

const urisResult = ['job/jobby/instance/bobby', 'job/hell_yeah/instance/saywhat', 'job/hell_yeah/app_name/got-ya', 'job/hell_yeah/instance/saywhat/app_name//'];

describe('Integration tests:', () => {

    describe('Fetch all groups of metrics from pushgateway and remove each one which expired', () => {

        let expectedToRemoved;

        it('Should remove all groups from the nock-pushgateway', async () => {

            expectedToRemoved = successBody.data.length;
            const scope = nock(PUSHGATEWAY_URL, {"encodedQueryParams":true})

                .get('/api/v1/metrics')
                .reply(200, successBody)

                .delete(uri => uri.includes('metrics'))
                .times(expectedToRemoved)
                .reply(202);

            const groups = await getMetricsGroups(PUSHGATEWAY_URL);
            const rangeTimeForExpiredGroup = 0;
            const expiredGroups = getExpiredGroups(groups, rangeTimeForExpiredGroup);
            const uris = await removeExpiredGroups(expiredGroups, PUSHGATEWAY_URL);
            scope.done();
            expect(uris).to.eql(urisResult);
        })

        it('Should remove 3 groups of metrics from pushgateway', async () => {

            expectedToRemoved = 3;
            const scope = nock(PUSHGATEWAY_URL, {"encodedQueryParams":true})

                .get('/api/v1/metrics')
                .reply(200, successBody)

                .delete(uri => uri.includes('metrics'))
                .times(expectedToRemoved)
                .reply(202);

            const groups = await getMetricsGroups(PUSHGATEWAY_URL);
            const rangeTimeForExpiredGroup = hoursInMilisec / 2; // an half hour ago
            const expiredGroups = getExpiredGroups(groups, rangeTimeForExpiredGroup);
            const uris = await removeExpiredGroups(expiredGroups, PUSHGATEWAY_URL);
            scope.done();
            expect(uris).to.eql(urisResult.slice(successBody.data.length - expectedToRemoved));
        })

        it('Should remove 1 groups of metrics from pushgateway', async () => {

            expectedToRemoved = 1;
            const scope = nock(PUSHGATEWAY_URL, {"encodedQueryParams":true})

                .get('/api/v1/metrics')
                .reply(200, successBody)

                .delete(uri => uri.includes('metrics'))
                .times(expectedToRemoved)
                .reply(202);

            const groups = await getMetricsGroups(PUSHGATEWAY_URL);
            const rangeTimeForExpiredGroup = hoursInMilisec * 3; // 3 hours
            const expiredGroups = getExpiredGroups(groups, rangeTimeForExpiredGroup);
            const uris = await removeExpiredGroups(expiredGroups, PUSHGATEWAY_URL);
            scope.done();
            expect(uris).to.eql(urisResult.slice(successBody.data.length - expectedToRemoved));
        })

        it('Should not remove any group of metrics from pushgateway', async () => {

            expectedToRemoved = 0;
            const scope = nock(PUSHGATEWAY_URL, {"encodedQueryParams":true})

                .get('/api/v1/metrics')
                .reply(200, successBody)

            const groups = await getMetricsGroups(PUSHGATEWAY_URL);
            const rangeTimeForExpiredGroup = hoursInMilisec * 4; // 4 hours
            const expiredGroups = getExpiredGroups(groups, rangeTimeForExpiredGroup);
            const uris = await removeExpiredGroups(expiredGroups, PUSHGATEWAY_URL);
            scope.done();
            expect(uris).to.eql([]);

        })
    })

    describe('Send slack notification', () => {

        it('Successful notification send', async () => {
            const slackUrl = 'http://someurl.com';
            const scope = nock(slackUrl, {"encodedQueryParams":true})
                .post('/', {"username":"Push Gateway Cleaner","text":"<!here> Cleanup completed","icon_emoji":":bathtub:","attachments":[{"color":"#ffcc00","fields":[{"title":"2 groups were deleted","value":"a,b"}]}]})
                .reply(200, );
            await notifySlack(['a', 'b'], slackUrl)
            scope.done();
        });
    });
});
