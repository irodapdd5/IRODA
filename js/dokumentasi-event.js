const API_URL =
    "https://iroda-backend.irodapdd5.workers.dev";


const params =
    new URLSearchParams(window.location.search);


const year =
    params.get("year");


const yearTitle =
    document.getElementById("yearTitle");

const eventCount =
    document.getElementById("eventCount");

const eventList =
    document.getElementById("eventList");


if (!year) {

    yearTitle.textContent =
        "Tahun tidak ditemukan";

    eventList.innerHTML = `
        <div class="error">
            Tahun dokumentasi tidak ditemukan.
        </div>
    `;

} else {

    yearTitle.textContent =
        `Dokumentasi Tahun ${year}`;

    loadEvents();

}


async function loadEvents() {

    try {

        const response =
            await fetch(`${API_URL}/events`);


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message ||
                "Gagal mengambil kegiatan"
            );

        }


        let events =
            data.data || [];


        /*
         * Hanya ambil event
         * sesuai tahun yang dipilih.
         */

        events =
            events.filter(
                event =>
                    Number(event.year) ===
                    Number(year)
            );


        /*
         * Urutkan berdasarkan
         * tanggal kegiatan paling awal.
         *
         * Kita perlu mengambil tanggal
         * pertama dari setiap event.
         */

        events.sort(
            (a, b) => {

                const dateA =
                    getFirstDate(a);

                const dateB =
                    getFirstDate(b);

                return dateA.localeCompare(dateB);

            }
        );


        eventCount.textContent =
            `${events.length} kegiatan`;


        if (events.length === 0) {

            eventList.innerHTML = `
                <div class="empty">
                    Belum ada kegiatan
                    pada tahun ${year}.
                </div>
            `;

            return;

        }


        eventList.innerHTML = "";


        /*
         * Tampilkan semua event
         */

        events.forEach(event => {

            const card =
                document.createElement("div");

            card.className =
                "event-card";


            const firstDate =
                getFirstDate(event);


            card.innerHTML = `

                <div class="event-info">

                    <span class="event-date">
                        ${formatDate(firstDate)}
                    </span>

                    <h3>
                        ${escapeHTML(event.name)}
                    </h3>

                    <p>
                        ${
                            escapeHTML(
                                event.description ||
                                "Tidak ada deskripsi kegiatan."
                            )
                        }
                    </p>

                </div>


                <a
                    href="event-detail.html?id=${event.id}"
                    class="view-button"
                >
                    Lihat Dokumentasi →
                </a>

            `;


            eventList.appendChild(card);

        });


    } catch (error) {

        console.error(error);

        eventCount.textContent =
            "";

        eventList.innerHTML = `
            <div class="error">
                Tidak dapat memuat
                dokumentasi kegiatan.
            </div>
        `;

    }

}


/*
 * Mengambil tanggal pertama
 * dari sebuah event.
 *
 * Kalau endpoint /events belum
 * mengirim dates, sementara
 * gunakan created_at sebagai fallback.
 */

function getFirstDate(event) {

    if (
        event.dates &&
        event.dates.length > 0
    ) {

        const dates =
            [...event.dates].sort(
                (a, b) =>
                    a.event_date.localeCompare(
                        b.event_date
                    )
            );

        return dates[0].event_date;

    }


    if (event.event_date) {
        return event.event_date;
    }


    if (event.created_at) {
        return event.created_at.substring(0, 10);
    }


    return `${year}-01-01`;

}


/*
 * Format tanggal Indonesia
 */

function formatDate(date) {

    if (!date) {
        return "Tanggal belum tersedia";
    }

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


/*
 * Mencegah HTML injection
 */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
