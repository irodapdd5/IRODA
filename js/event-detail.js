const API_URL =
    "https://iroda-backend.irodapdd5.workers.dev";


// ==========================
// AMBIL ID EVENT
// ==========================

const params =
    new URLSearchParams(window.location.search);

const eventId =
    params.get("id");


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

const imageContainer =
    document.getElementById("eventImageContainer");


// ==========================
// VALIDASI ID
// ==========================

if (!eventId) {

    eventName.textContent =
        "Event tidak ditemukan";

    eventYear.textContent =
        "";

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
                `${API_URL}/events/${encodeURIComponent(eventId)}`
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
        // FOTO EVENT
        // ==========================

        if (imageContainer) {

            if (event.image) {

                imageContainer.innerHTML = `
                    <img
                        src="${event.image}"
                        alt="${escapeHTML(event.name)}"
                        class="event-main-image"
                    >
                `;

            } else {

                imageContainer.innerHTML = "";

            }

        }


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


        // ==========================
        // URUTKAN TANGGAL
        // ==========================

        dates.sort(
            (a, b) =>
                a.event_date.localeCompare(
                    b.event_date
                )
        );


        dateList.innerHTML = "";


        // ==========================
        // TAMPILKAN TANGGAL
        // ==========================

        dates.forEach(date => {

            const card =
                document.createElement("div");

            card.className =
                "date-card";


            const dateInfo =
                document.createElement("div");

            dateInfo.className =
                "date-info";


            const dateIcon =
                document.createElement("div");

            dateIcon.className =
                "date-icon";

            dateIcon.textContent =
                "📅";


            const info =
                document.createElement("div");


            const label =
                document.createElement("span");

            label.textContent =
                "Tanggal Kegiatan";


            const dateText =
                document.createElement("strong");

            dateText.textContent =
                formatDate(
                    date.event_date
                );


            info.appendChild(label);
            info.appendChild(dateText);

            dateInfo.appendChild(dateIcon);
            dateInfo.appendChild(info);


            // ==========================
            // GOOGLE DRIVE
            // ==========================

            const driveButton =
                document.createElement("a");

            driveButton.href =
                date.drive_link || "#";

            driveButton.target =
                "_blank";

            driveButton.rel =
                "noopener noreferrer";

            driveButton.className =
                "drive-button";

            driveButton.textContent =
                "📁 Buka Google Drive";


            if (!date.drive_link) {

                driveButton.removeAttribute(
                    "target"
                );

                driveButton.removeAttribute(
                    "rel"
                );

                driveButton.textContent =
                    "📁 Link belum tersedia";

                driveButton.classList.add(
                    "disabled"
                );

            }


            card.appendChild(dateInfo);
            card.appendChild(driveButton);

            dateList.appendChild(card);

        });


    } catch (error) {

        console.error(error);

        eventName.textContent =
            "Gagal memuat event";

        eventYear.textContent =
            "";

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
