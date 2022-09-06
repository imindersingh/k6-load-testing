# k6 Load Testing

## Running tests

With options including `vu` and `duration`, for example:

`k6 run --vus 10 --duration 30s test-script.js` - will run a 30 second, 10-VU load test

If options are defined in the tests: `k6 run {script}.js`

## Test Structure

```javascript
// 1. init code

export function setup() {
  // 2. setup code
}

export default function (data) {
  // 3. VU code
}

export function teardown(data) {
  // 4. teardown code
}
```

See https://k6.io/docs/using-k6/test-life-cycle/ for more info.

## Metric Definitions

Source - <https://betterprogramming.pub/an-introduction-to-k6-an-api-load-testing-tool-132a0d87827d>

### k6

- `vus` — number of active virtual users
- `vus_max` — maximum virtual users allocated for the test
- `iterations` — aggregated number of times the default function is called
- `iteration_duration` — the total time it took to execute the default function
- `dropped_iterations` — number of iterations that couldn’t be started
- `data_received` — amount of data received
- `data_sent` — amount of data sent
- `checks` — rate of successful checks

### http

- `http_reqs` — total requests generated by k6
- `http_req_blocked` — time spent waiting for a free TCP connection before initiating the request
- `http_req_connecting` — time spent establishing a TCP connection
- `http_req_tls_handshaking` — time spent on TLS handshaking
- `http_req_sending` — time spent on data sending
- `http_req_waiting` — time spent waiting for a response from the remote host
- `http_req_receiving` — time spent on data receiving
- `http_req_duration` — total time for the request. It’s calculated based on `http_req_sending + http_req_waiting + http_req_receiving`.

## Testing Profiles

Example testing profiles for load, stress and spike testing.
Source: https://betterprogramming.pub/an-introduction-to-k6-an-api-load-testing-tool-132a0d87827d

### Smoke

Regular load test with minimal load to ensure that scripts don't have errors and the system doesn't throw errors when under minimal load.

```javascript
export const options = {
  vus: 1, // 1 user looping for 1 minute
  duration: '1m',

  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
  },
};
```

### Load

Ramp up, maintain for duration and ramp down to assess the current performance of your system: users or requests / per sec.

Consider users at peak hours, and use this for normal/peak hours simulation.

```javascript
export let options = {
  stages: [
    { duration: '5m', target: 100 },
    { duration: '10m', target: 100 },
    { duration: '5m', target: 0 },
  ],
};
```

### Indurance / Soak

Maintain a consistent expected load over a long period. Consider a soak test at 80% of system capacity. For example, if max concurrent users is 100, then soak test with 80 VUs

```javascript
export let options = {
  stages: [
    { duration: '5m', target: 80 },
    { duration: '3h56m', target: 80 },
    { duration: '5m', target: 0 },
  ],
};
```

### Stress

Constant ramping up of VUs over a period of time to assess the availability and stability of the system under heavy load.

```javascript
export let options = {
  stages: [
    { duration: '1m', target: 100 }, //below normal load
    { duration: '5m', target: 100 },
    { duration: '1m', target: 200 }, //normal load
    { duration: '5m', target: 200 },
    { duration: '1m', target: 300 }, //breaking point
    { duration: '5m', target: 300 },
    { duration: '1m', target: 400 }, //beyond breaking point
    { duration: '5m', target: 400 },
    { duration: '5m', target: 0 }, //scale down
  ],
};
```

### Spike / Peak

Overwhelm system with a sudden surge within a short period.

```javascript
export let options = {
  stages: [
    { duration: '10s', target: 100 },
    { duration: '2m', target: 100 },
    { duration: '10s', target: 1000 }, //surge
    { duration: '2m', target: 1000 }, //surge
    { duration: '10s', target: 100 },
    { duration: '2m', target: 100 },
    { duration: '10s', target: 0 },
  ],
};

```

### Breakpoint

Ramp-load load to determine breaking point. In this example, assume during peak hours the system sees an average of 400 concurrent users (designed to handle this max load), this profile would ramp-up beyond to determine breaking point or the max number of users (or requests) before breaking point.

```javascript
export let options = {
  stages: [
    { duration: '5m', target: 100 },
    { duration: '5m', target: 200 },
    { duration: '5m', target: 300 },
    { duration: '5m', target: 400 },
    { duration: '5m', target: 500 },
    { duration: '5m', target: 600 },
    { duration: '5m', target: 700 },
  ],
};

```
