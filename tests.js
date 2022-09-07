import http from 'k6/http'
import { check, group, sleep } from 'k6'
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.0.0/index.js'

const BASE_URL = 'https://httpbin.test.k6.io'


export const options = {
	stages: [
		{ duration: '1m', target: 100 },
		// { duration: '1h', target: 100 },
		// { duration: '5m', target: 0 },
	],
	thresholds: {
		checks: [
			{
				threshold: 'rate>=0.90',
				abortOnFail: true,
				delayAbortEval: '10s',
			},
		],
		http_req_duration: ['p(90) < 100', 'p(95) < 104', 'p(99.9) < 2000'],
		http_req_failed: [
			{
				threshold: 'rate<=0.05',
				abortOnFail: true,
				delayAbortEval: '10s'
			},
		],
	},
}

export default function () {
    const response = http.post(`${BASE_URL}/post`, 'Hello world!')
    check(response, {
        'Status code': (r) => r.status == 200,
        'Response body': (r) => r.body.includes('Hello world!')
    });
    sleep(randomIntBetween(1,3));
}