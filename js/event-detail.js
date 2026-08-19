const API_URL =
    "https://iroda-backend.irodapdd5.workers.dev";


// ==========================
// CEK LOGIN
// ==========================

if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "login.html";
}


// ==========================
// AMBIL ID EVENT
// ==========================

const params =
    new URLSearchParams(window.location.search);

const eventId =
    params.get("id");


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

        document.getElementById(
            "adminName"
        ).textContent = name;

        document.getElementById(
            "avatar"
        ).textContent =
            name.charAt(0).toUpperCase();

    } catch (error) {

        console.error(error);

    }

}


// ==========================
// ELEMENT
// ==========================

const eventName =
    document.getElementById("eventName");

const eventYear =
    document.getElementById("eventYear");

const eventDescription =
    document.getElementById("eventDescription");

const dateList =
    document.getElementById("dateList");


// ==========================
// VALIDASI ID
// ==========================

if (!eventId) {

    eventName.textContent =
        "Event tidak ditemukan";

    eventDescription.textContent =
        "ID event tidak tersedia.";

    dateList.innerHTML = `
        <div class="error">
            Event tidak ditemukan.
        </div>
    `;

} else {

    loadEvent();

}


// ==========================
// LOAD EVENT
// ==========================

async function loadEvent() {

    try {

        const response =
            await fetch(
                `${API_URL}/events/${eventId}`
            );

        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message ||
                "Event tidak ditemukan"
            );

        }


        const event =
            data.event;

        const dates =
            data.dates || [];


        // ==========================
        // EVENT INFO
        // ==========================

        eventName.textContent =
            event.name;

        eventYear.textContent =
            `Tahun ${event.year}`;

        eventDescription.textContent =
            event.description ||
            "Tidak ada deskripsi kegiatan.";


        // ==========================
        // DATES
        // ==========================

        if (dates.length === 0) {

            dateList.innerHTML = `
                <div class="empty">
                    Belum ada tanggal dokumentasi.
                </div>
            `;

            return;
        }


        // Urutkan berdasarkan tanggal

        dates.sort(
            (a, b) =>
                a.event_date.localeCompare(
                    b.event_date
                )
        );


        dateList.innerHTML = "";


        dates.forEach(date => {

            const card =
                document.createElement("div");

            card.className =
                "date-card";


            card.innerHTML = `

                <div class="date-info">

                    <div class="date-icon">
                        📅
                    </div>

                    <div>

                        <span>
                            Tanggal Kegiatan
                        </span>

                        <strong>
                            ${formatDate(
                                date.event_date
                            )}
                        </strong>

                    </div>

                </div>


                <a
                    href="${escapeAttribute(
                        date.drive_link
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="drive-button"
                >
                    📁 Buka Google Drive
                </a>

            `;


            dateList.appendChild(card);

        });


    } catch (error) {

        console.error(error);

        eventName.textContent =
            "Gagal memuat event";

        eventDescription.textContent =
            "";

        dateList.innerHTML = `
            <div class="error">
                ${escapeHTML(
                    error.message ||
                    "Tidak dapat mengambil data event."
                )}
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
            weekday: "long",
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


function escapeAttribute(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");

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
