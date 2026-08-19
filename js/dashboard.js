const API_URL =
    "https://iroda-backend.irodapdd5.workers.dev";


// ==========================
// CEK LOGIN
// ==========================

if (localStorage.getItem("isLoggedIn") !== "true") {

    window.location.href = "login.html";

}


// ==========================
// DATA ADMIN
// ==========================

const adminData =
    localStorage.getItem("admin");

if (adminData) {

    try {

        const admin =
            JSON.parse(adminData);

        const name =
            admin.name || "Admin";

        document.getElementById("adminName")
            .textContent = name;

        document.getElementById("welcomeName")
            .textContent = name;

        document.getElementById("avatar")
            .textContent =
            name.charAt(0).toUpperCase();

    } catch (error) {

        console.error(
            "Data admin tidak valid:",
            error
        );

    }

}


// ==========================
// LOAD DASHBOARD
// ==========================

async function loadDashboard() {

    try {

        const response =
            await fetch(`${API_URL}/events`);

        const data =
            await response.json();

        if (!data.success) {

            throw new Error(
                data.message ||
                "Gagal mengambil event"
            );

        }


        const events =
            data.data || [];


        // TOTAL EVENT

        document.getElementById(
            "totalEvents"
        ).textContent = events.length;


        // TOTAL TAHUN

        const years =
            new Set(
                events.map(event => event.year)
            );

        document.getElementById(
            "totalYears"
        ).textContent = years.size;


        // EVENT TERBARU

        const recentEvents =
            document.getElementById(
                "recentEvents"
            );


        if (events.length === 0) {

            recentEvents.innerHTML = `
                <div class="empty">
                    Belum ada dokumentasi event.
                </div>
            `;

            return;
        }


        recentEvents.innerHTML = "";


        events
            .slice(0, 5)
            .forEach(event => {

                const item =
                    document.createElement("div");

                item.className =
                    "recent-event";

                item.innerHTML = `

                    <div>

                        <h4>
                            ${escapeHTML(event.name)}
                        </h4>

                        <p>
                            ${event.first_date
                                ? formatDate(event.first_date)
                                : "Belum ada tanggal"
                            }
                        </p>

                    </div>

                    <span class="year">
                        ${event.year}
                    </span>

                `;

                recentEvents.appendChild(item);

            });


    } catch (error) {

        console.error(error);

        document.getElementById(
            "recentEvents"
        ).innerHTML = `

            <div class="empty">
                Tidak dapat memuat data event.
            </div>

        `;

    }

}


// ==========================
// FORMAT TANGGAL
// ==========================

function formatDate(date) {

    return new Date(
        date + "T00:00:00"
    ).toLocaleDateString(
        "id-ID",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


// ==========================
// ESCAPE HTML
// ==========================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ==========================
// LOGOUT
// ==========================

document
    .getElementById("logoutButton")
    .addEventListener("click", function () {

        localStorage.removeItem(
            "isLoggedIn"
        );

        localStorage.removeItem(
            "admin"
        );

        window.location.href =
            "login.html";

    });


// ==========================
// START
// ==========================

loadDashboard();
