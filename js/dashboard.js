const API_URL =
    "https://iroda-backend.irodapdd5.workers.dev";


// ==========================
// CEK LOGIN
// ==========================

if (
    localStorage.getItem("isLoggedIn") !== "true"
) {
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


        const adminName =
            document.getElementById("adminName");

        const welcomeName =
            document.getElementById("welcomeName");

        const avatar =
            document.getElementById("avatar");


        if (adminName) {
            adminName.textContent = name;
        }

        if (welcomeName) {
            welcomeName.textContent = name;
        }

        if (avatar) {
            avatar.textContent =
                name.charAt(0).toUpperCase();
        }


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

        // =====================================
        // AMBIL EVENT DAN JADWAL BERSAMAAN
        // =====================================

        const [
            eventsResponse,
            schedulesResponse
        ] = await Promise.all([

            fetch(
                `${API_URL}/events`
            ),

            fetch(
                `${API_URL}/schedules`
            )

        ]);


        const eventsData =
            await eventsResponse.json();

        const schedulesData =
            await schedulesResponse.json();


        // =====================================
        // VALIDASI EVENT
        // =====================================

        if (
            !eventsResponse.ok ||
            !eventsData.success
        ) {

            throw new Error(
                eventsData.message ||
                "Gagal mengambil event"
            );

        }


        // =====================================
        // VALIDASI JADWAL
        // =====================================

        if (
            !schedulesResponse.ok ||
            !schedulesData.success
        ) {

            throw new Error(
                schedulesData.message ||
                "Gagal mengambil jadwal"
            );

        }


        const events =
            eventsData.data || [];


        const schedules =
            Array.isArray(
                schedulesData.schedules
            )
                ? schedulesData.schedules
                : [];


        // =====================================
        // TOTAL EVENT
        // =====================================

        const totalEvents =
            document.getElementById(
                "totalEvents"
            );

        if (totalEvents) {

            totalEvents.textContent =
                events.length;

        }


        // =====================================
        // TOTAL JADWAL
        // =====================================

        const totalSchedules =
            document.getElementById(
                "totalSchedules"
            );

        if (totalSchedules) {

            totalSchedules.textContent =
                schedules.length;

        }


        // =====================================
        // TOTAL TAHUN
        // =====================================

        const years =
            new Set();


        events.forEach(
            event => {

                if (event.year) {
                    years.add(
                        event.year
                    );
                }

            }
        );


        schedules.forEach(
            schedule => {

                if (
                    schedule.schedule_date
                ) {

                    const year =
                        schedule.schedule_date
                            .substring(0, 4);

                    if (year) {
                        years.add(year);
                    }

                }

            }
        );


        const totalYears =
            document.getElementById(
                "totalYears"
            );

        if (totalYears) {

            totalYears.textContent =
                years.size;

        }


        // =====================================
        // EVENT TERBARU
        // =====================================

        renderRecentEvents(events);


        // =====================================
        // JADWAL TERBARU
        // =====================================

        renderRecentSchedules(
            schedules
        );


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        const recentEvents =
            document.getElementById(
                "recentEvents"
            );

        const recentSchedules =
            document.getElementById(
                "recentSchedules"
            );


        if (recentEvents) {

            recentEvents.innerHTML = `
                <div class="empty">
                    Tidak dapat memuat data event.
                </div>
            `;

        }


        if (recentSchedules) {

            recentSchedules.innerHTML = `
                <div class="empty">
                    Tidak dapat memuat data jadwal.
                </div>
            `;

        }

    }

}


// ==========================
// RENDER EVENT TERBARU
// ==========================

function renderRecentEvents(events) {

    const container =
        document.getElementById(
            "recentEvents"
        );


    if (!container) {
        return;
    }


    if (events.length === 0) {

        container.innerHTML = `
            <div class="empty">
                Belum ada dokumentasi event.
            </div>
        `;

        return;

    }


    // URUTKAN EVENT TERBARU

    const sortedEvents =
        [...events].sort(
            (a, b) => {

                const dateA =
                    a.first_date ||
                    `${a.year}-01-01`;

                const dateB =
                    b.first_date ||
                    `${b.year}-01-01`;

                return dateB.localeCompare(
                    dateA
                );

            }
        );


    container.innerHTML = "";


    sortedEvents
        .slice(0, 5)
        .forEach(
            event => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "recent-event";


                item.innerHTML = `

                    <div>

                        <h4>
                            ${escapeHTML(
                                event.name
                            )}
                        </h4>

                        <p>
                            ${
                                event.first_date
                                    ? formatDate(
                                        event.first_date
                                    )
                                    : "Belum ada tanggal"
                            }
                        </p>

                    </div>


                    <span class="year">

                        ${escapeHTML(
                            event.year
                        )}

                    </span>

                `;


                container.appendChild(
                    item
                );

            }
        );

}


// ==========================
// RENDER JADWAL TERBARU
// ==========================

function renderRecentSchedules(
    schedules
) {

    const container =
        document.getElementById(
            "recentSchedules"
        );


    if (!container) {
        return;
    }


    if (schedules.length === 0) {

        container.innerHTML = `
            <div class="empty">
                Belum ada jadwal kegiatan.
            </div>
        `;

        return;

    }


    // URUTKAN BERDASARKAN TANGGAL

    const sortedSchedules =
        [...schedules].sort(
            (a, b) => {

                const dateA =
                    a.schedule_date || "";

                const dateB =
                    b.schedule_date || "";

                return dateA.localeCompare(
                    dateB
                );

            }
        );


    container.innerHTML = "";


    sortedSchedules
        .slice(0, 5)
        .forEach(
            schedule => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "recent-event";


                item.innerHTML = `

                    <div>

                        <h4>
                            ${escapeHTML(
                                schedule.title
                            )}
                        </h4>

                        <p>

                            ${
                                schedule.schedule_date
                                    ? formatDate(
                                        schedule.schedule_date
                                    )
                                    : "-"
                            }

                            ${
                                schedule.schedule_time
                                    ? " • " +
                                      escapeHTML(
                                          schedule.schedule_time
                                      )
                                    : ""
                            }

                            ${
                                schedule.location
                                    ? " • " +
                                      escapeHTML(
                                          schedule.location
                                      )
                                    : ""
                            }

                        </p>

                    </div>


                    <span class="year">

                        ${
                            schedule.schedule_date
                                ? escapeHTML(
                                    schedule.schedule_date
                                        .substring(0, 4)
                                )
                                : "-"
                        }

                    </span>

                `;


                container.appendChild(
                    item
                );

            }
        );

}


// ==========================
// FORMAT TANGGAL
// ==========================

function formatDate(date) {

    if (!date) {
        return "-";
    }


    const parsedDate =
        new Date(
            date + "T00:00:00"
        );


    if (
        isNaN(
            parsedDate.getTime()
        )
    ) {

        return date;

    }


    return parsedDate.toLocaleDateString(
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

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


// ==========================
// LOGOUT
// ==========================

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "isLoggedIn"
            );

            localStorage.removeItem(
                "admin"
            );


            window.location.href =
                "index.html";

        }
    );

}


// ==========================
// START
// ==========================

loadDashboard();
