import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
    vus: 1, //simple for now..
    iterations: 1,
};

export default function () {
    
    // 1. LOGIN
    
    const login = http.post(
        `${BASE_URL}/api/v1/auth/login`,
        JSON.stringify({
            email: __ENV.LOAD_TEST_EMAIL,
            password: __ENV.LOAD_TEST_PASSWORD,
        }),
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
    
    console.log(`LOGIN: ${login.status} ${login.timings.duration}ms`);
    
    check(login, {
        "login: status 200": (r) => r.status === 200,
    });
    
    sleep(1);
    
    
    const me = http.get(
        `${BASE_URL}/api/v1/auth/me`
    );
    
    console.log(`ME: ${me.status} ${me.timings.duration}ms`);
    
    check(me, {
        "me: status 200": (r) => r.status === 200,
    });
    
    sleep(1);
    
    
    const companies = http.get(
        `${BASE_URL}/api/v1/companies`
    );
    
    console.log(`COMPANIES: ${companies.status} ${companies.timings.duration}ms`);
    
    check(companies, {
        "companies: status 200": (r) => r.status === 200,
    });
    
    sleep(1);
    
    
    const activities = http.get(
        `${BASE_URL}/api/v1/activities/followups`
    );
    
    console.log(`ACTIVITIES: ${activities.status} ${activities.timings.duration}ms`);
    
    check(activities, {
        "activities: status 200": (r) => r.status === 200,
    });
    
    sleep(1);
    
    
    const notifications = http.get(
        `${BASE_URL}/api/v1/notifications`
    );
    
    console.log(`NOTIFICATIONS: ${notifications.status} ${notifications.timings.duration}ms`);
    
    check(notifications, {
        "notifications: status 200": (r) => r.status === 200,
    });
    
    sleep(1);
}

/*k6 run \
  -e LOAD_TEST_EMAIL="loadtest@sponscrm.test" \
  -e LOAD_TEST_PASSWORD="pass1234" \
  load-tests/smoke.js*/