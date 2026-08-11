import http from "k6/http";
import { check, sleep } from "k6";

// ============================================================
// CONFIGURATION
// ============================================================

export const options = {
    stages: [
        { duration: "30s", target: 10 },
        { duration: "1m", target: 10 },

        { duration: "30s", target: 20 },
        { duration: "1m", target: 20 },

        { duration: "30s", target: 30 },
        { duration: "1m", target: 30 },

        { duration: "30s", target: 50 },
        { duration: "2m", target: 50 },

        { duration: "30s", target: 0 },
    ],

    thresholds: {
        // 95% of requests should finish under 5 seconds
        http_req_duration: ["p(95)<5000"],

        // Less than 5% of requests should fail
        http_req_failed: ["rate<0.05"],
    },
};

// ============================================================
// TARGET
// ============================================================

// LOCAL BACKEND
const BASE_URL = "http://localhost:3000/api/v1";

// When you are ready to test Render, change ONLY this:
// const BASE_URL = "https://api.sponscrm.tech/api/v1";


// ============================================================
// TEST USERS
// ============================================================

// Create at least 50 users:
//
// loadtest01@sponscrm.test
// loadtest02@sponscrm.test
// ...
// loadtest50@sponscrm.test
//
// All should have:
// password: pass1234
//
// Ideally put all of them in the same organization so the test
// resembles the real SponsCRM workload.

const users = Array.from({ length: 50 }, (_, i) => ({
    email: `loadtest${String(i + 1).padStart(2, "0")}@sponscrm.test`,
    password: "pass1234",
}));


// ============================================================
// PER-VU LOGIN STATE
// ============================================================

let loggedIn = false;


// ============================================================
// LOGIN
// ============================================================

function login(user) {

    const response = http.post(
        `${BASE_URL}/auth/login`,
        JSON.stringify({
            email: user.email,
            password: user.password,
        }),
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    check(response, {
        "login successful": (r) => r.status === 200,
    });

    if (response.status !== 200) {

        console.log(
            `VU ${__VU} LOGIN FAILED: ${response.status}`
        );

        return false;
    }

    loggedIn = true;

    return true;
}


// ============================================================
// MAIN USER WORKLOAD
// ============================================================

export default function () {

    // --------------------------------------------------------
    // Assign one account to this VU
    // --------------------------------------------------------

    const user = users[__VU - 1];

    if (!user) {

        console.log(
            `VU ${__VU}: No test account configured`
        );

        return;
    }


    // --------------------------------------------------------
    // LOGIN
    // --------------------------------------------------------

    if (!loggedIn) {

        const success = login(user);

        if (!success) {
            sleep(2);
            return;
        }

        // Simulate time after login
        sleep(1);
    }


    // ========================================================
    // GET /ME
    // ========================================================

    const me = http.get(
        `${BASE_URL}/auth/me`
    );

    check(me, {
        "me successful": (r) => r.status === 200,
    });

    if (me.status === 401) {

        console.log(
            `VU ${__VU}: /me returned 401`
        );

        loggedIn = false;

        return;
    }

    sleep(1);


    // ========================================================
    // GET COMPANIES
    // ========================================================

    const companies = http.get(
        `${BASE_URL}/companies`
    );

    check(companies, {
        "companies successful": (r) => r.status === 200,
    });

    if (companies.status === 401) {

        console.log(
            `VU ${__VU}: /companies returned 401`
        );

        loggedIn = false;

        return;
    }

    sleep(1);


    // ========================================================
    // GET ACTIVITIES / FOLLOWUPS
    // ========================================================

    // Your actual backend route is:
    //
    // GET /api/v1/activities/followups
    //
    // NOT /activities/follow-ups

    const activities = http.get(
        `${BASE_URL}/activities/followups`
    );

    check(activities, {
        "activities successful": (r) => r.status === 200,
    });

    if (activities.status === 401) {

        console.log(
            `VU ${__VU}: /activities returned 401`
        );

        loggedIn = false;

        return;
    }

    sleep(1);


    // ========================================================
    // GET NOTIFICATIONS
    // ========================================================

    const notifications = http.get(
        `${BASE_URL}/notifications`
    );

    check(notifications, {
        "notifications successful": (r) => r.status === 200,
    });

    if (notifications.status === 401) {

        console.log(
            `VU ${__VU}: /notifications returned 401`
        );

        loggedIn = false;

        return;
    }


    // ========================================================
    // USER THINKING TIME
    // ========================================================

    // Simulate a user reading the page / deciding what to do.
    sleep(2);
}