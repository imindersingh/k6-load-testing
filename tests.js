import http from 'k6/http'
import { check, group, sleep } from 'k6'

const BASE_URL = 'https://jsonplaceholder.typicode.com'

export const options = {
    stages: [
        { duration: '20s', target: 20 },
        { duration: '1m', target: 20 },
        { duration: '20s', target: 0 },
    ],
    thresholds: {
        checks: [
            { threshold: 'rate>0.9', abortOnFail: true, delayAbortEval: '10s' },
        ],
        http_req_duration: ['avg<50'],
    },
};

export default function () {
    const response = http.get(`${BASE_URL}/posts`)
    check(response, {
        'status was 200': (r) => r.status == 200
    });
    sleep(1);
}