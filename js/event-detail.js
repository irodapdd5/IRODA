const API_URL =
    "https://iroda-backend.irodapdd5.workers.dev";


// ==========================
// AMBIL ID EVENT
// ==========================

const params =
    new URLSearchParams(
        window.location.search
    );

const eventId =
    params.get("id");


// ==========================
// ELEMENT
// ==========================

const eventHeader =
    document.querySelector(
        ".event-header"
    );


const eventName =
    document.getElementById(
        "eventName"
    );


const eventYear =
    document.getElementById(
        "eventYear"
    );


const eventDescription =
    document.getElementById(
        "eventDescription"
    );


const dateList =
    document.getElementById(
        "dateList"
    );


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


        // ==========================
        // VALIDASI RESPONSE
        // ==========================

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
            event.name || "Tanpa nama event";


        eventYear.textContent =
            `Tahun ${event.year || "-"}`;


        eventDescription.textContent =
            event.description ||
            "Tidak ada deskripsi kegiatan.";


        // ==========================
        // FOTO EVENT
        // ==========================

        if (
            event.image &&
            event.image.trim() !== ""
        ) {

            eventHeader.style.setProperty(
                "--event-image",
                `url("${event.image}")`
            );


            eventHeader.classList.add(
                "has-image"
            );

        } else {

            eventHeader.classList.remove(
                "has-image"
            );

            eventHeader.style.removeProperty(
                "--event-image"
            );

        }


        // ==========================
        // CEK TANGGAL
        // ==========================

        if (
            dates.length === 0
        ) {

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


        // ==========================
        // KOSONGKAN LIST
        // ==========================

        dateList.innerHTML =
            "";


        // ==========================
        // TAMPILKAN TANGGAL
        // ==========================

        dates.forEach(
            date => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "date-card";


                // ==========================
                // DATE INFO
                // ==========================

                const dateInfo =
                    document.createElement(
                        "div"
                    );


                dateInfo.className =
                    "date-info";


                // ==========================
                // ICON
                // ==========================

                const dateIcon =
                    document.createElement(
                        "div"
                    );


                dateIcon.className =
                    "date-icon";


                // Tidak menggunakan emoji.
                // CSS akan memberikan icon
                // Font Awesome.


                // ==========================
                // INFO TEXT
                // ==========================

                const info =
                    document.createElement(
                        "div"
                    );


                const label =
                    document.createElement(
                        "span"
                    );


                label.textContent =
                    "Tanggal Kegiatan";


                const dateText =
                    document.createElement(
                        "strong"
                    );


                dateText.textContent =
                    formatDate(
                        date.event_date
                    );


                info.appendChild(
                    label
                );


                info.appendChild(
                    dateText
                );


                dateInfo.appendChild(
                    dateIcon
                );


                dateInfo.appendChild(
                    info
                );


                // ==========================
                // GOOGLE DRIVE BUTTON
                // ==========================

                const driveButton =
                    document.createElement(
                        "a"
                    );


                driveButton.className =
                    "drive-button";


                driveButton.textContent =
                    "Buka Google Drive";


                if (
                    date.drive_link &&
                    date.drive_link.trim() !== ""
                ) {

                    driveButton.href =
                        date.drive_link;


                    driveButton.target =
                        "_blank";


                    driveButton.rel =
                        "noopener noreferrer";

                } else {

                    driveButton.href =
                        "#";


                    driveButton.textContent =
                        "Link belum tersedia";


                    driveButton.classList.add(
                        "disabled"
                    );


                    driveButton.addEventListener(
                        "click",
                        function (e) {

                            e.preventDefault();

                        }
                    );

                }


                // ==========================
                // MASUKKAN KE CARD
                // ==========================

                card.appendChild(
                    dateInfo
                );


                card.appendChild(
                    driveButton
                );


                dateList.appendChild(
                    card
                );

            }
        );


    } catch (error) {

        console.error(
            "Gagal memuat event:",
            error
        );


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

function formatDate(
    date
) {

    if (!date) {

        return "-";

    }


    return new Date(
        date + "T00:00:00"
    ).toLocaleDateString(
        "id-ID",
        {

            weekday:
                "long",

            day:
                "numeric",

            month:
                "long",

            year:
                "numeric"

        }
    );

}


// ==========================
// ESCAPE HTML
// ==========================

function escapeHTML(
    value
) {

    return String(
        value
    )

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
