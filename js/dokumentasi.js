const API_URL =
    "https://iroda-backend.irodapdd5.workers.dev";

const yearList =
    document.getElementById("yearList");


loadYears();


async function loadYears() {

    try {

        const response =
            await fetch(`${API_URL}/events`);

        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message ||
                "Gagal mengambil dokumentasi"
            );

        }


        const events =
            data.data || [];


        if (events.length === 0) {

            yearList.innerHTML = `
                <div class="empty">
                    Belum ada dokumentasi kegiatan.
                </div>
            `;

            return;
        }


        /*
         * Ambil semua tahun
         * tanpa duplikat
         */

        const years = [
            ...new Set(
                events.map(event => event.year)
            )
        ];


        /*
         * Tahun terbaru di atas
         */

        years.sort(
            (a, b) => b - a
        );


        yearList.innerHTML = "";


        years.forEach(year => {

            const total =
                events.filter(
                    event =>
                        Number(event.year) ===
                        Number(year)
                ).length;


            const card =
                document.createElement("div");

            card.className =
                "year-card";


            card.innerHTML = `

                <div class="year-icon">
                    📅
                </div>

                <span>
                    Dokumentasi Tahun
                </span>

                <strong>
                    ${year}
                </strong>

                <span>
                    ${total} kegiatan
                </span>

                <br>

                <a
                    href="dokumentasi-event.html?year=${encodeURIComponent(year)}"
                    class="year-button"
                >
                    Lihat Kegiatan →
                </a>

            `;


            yearList.appendChild(card);

        });


    } catch (error) {

        console.error(error);

        yearList.innerHTML = `
            <div class="error">
                Tidak dapat memuat dokumentasi.
            </div>
        `;

    }

}
