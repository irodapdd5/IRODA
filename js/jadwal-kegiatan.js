/* =========================================
   DATA CONTOH
========================================= */

const activities = {

    "2026-08-10": [
        {
            title: "Rapat Persiapan HUT Kemerdekaan",
            description: "Persiapan kegiatan HUT Kemerdekaan bersama anggota IRODA."
        }
    ],

    "2026-08-17": [
        {
            title: "HUT Kemerdekaan RI",
            description: "Kegiatan perayaan HUT Kemerdekaan bersama warga RT.02."
        }
    ],

    "2026-08-20": [
        {
            title: "Evaluasi Kegiatan",
            description: "Evaluasi kegiatan dan dokumentasi HUT Kemerdekaan."
        }
    ]

};


/* =========================================
   ELEMENT
========================================= */

const monthTitle =
    document.getElementById("monthTitle");

const calendarGrid =
    document.getElementById("calendarGrid");

const prevMonth =
    document.getElementById("prevMonth");

const nextMonth =
    document.getElementById("nextMonth");

const selectedDateTitle =
    document.getElementById("selectedDateTitle");

const activityList =
    document.getElementById("activityList");


/* =========================================
   STATE
========================================= */

let currentDate =
    new Date();

let selectedDate =
    null;


/* =========================================
   NAMA BULAN
========================================= */

const monthNames = [

    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember"

];


/* =========================================
   FORMAT KEY
========================================= */

function getDateKey(
    year,
    month,
    day
) {

    return (
        year +
        "-" +
        String(month + 1).padStart(2, "0") +
        "-" +
        String(day).padStart(2, "0")
    );

}


/* =========================================
   RENDER CALENDAR
========================================= */

function renderCalendar() {

    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();


    monthTitle.textContent =
        `${monthNames[month]} ${year}`;


    calendarGrid.innerHTML =
        "";


    /*
        Hari pertama bulan.
        JS:
        Minggu = 0
        Senin = 1
        ...
    */

    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    /*
        Kita ingin minggu dimulai
        dari Senin.

        Minggu (0) menjadi 6.
    */

    const startingDay =
        firstDay === 0
            ? 6
            : firstDay - 1;


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const daysInPreviousMonth =
        new Date(
            year,
            month,
            0
        ).getDate();


    /* =====================================
       TANGGAL BULAN SEBELUMNYA
    ===================================== */

    for (
        let i = startingDay - 1;
        i >= 0;
        i--
    ) {

        const day =
            daysInPreviousMonth - i;


        const previousMonth =
            month === 0
                ? 11
                : month - 1;


        const previousYear =
            month === 0
                ? year - 1
                : year;


        const key =
            getDateKey(
                previousYear,
                previousMonth,
                day
            );


        createDay(
            day,
            key,
            true
        );

    }


    /* =====================================
       TANGGAL BULAN SEKARANG
    ===================================== */

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const key =
            getDateKey(
                year,
                month,
                day
            );


        createDay(
            day,
            key,
            false
        );

    }


    /* =====================================
       TANGGAL BULAN BERIKUTNYA
    ===================================== */

    const totalCells =
        calendarGrid.children.length;


    const remaining =
        totalCells % 7 === 0
            ? 0
            : 7 -
              (totalCells % 7);


    for (
        let day = 1;
        day <= remaining;
        day++
    ) {

        const nextMonth =
            month === 11
                ? 0
                : month + 1;


        const nextYear =
            month === 11
                ? year + 1
                : year;


        const key =
            getDateKey(
                nextYear,
                nextMonth,
                day
            );


        createDay(
            day,
            key,
            true
        );

    }

}


/* =========================================
   CREATE DAY
========================================= */

function createDay(
    day,
    dateKey,
    otherMonth
) {

    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";


    button.className =
        "calendar-day";


    button.textContent =
        day;


    button.setAttribute(
        "role",
        "gridcell"
    );


    button.setAttribute(
        "aria-label",
        dateKey
    );


    if (otherMonth) {

        button.classList.add(
            "other-month"
        );

    }


    /* =====================================
       KEGIATAN
    ===================================== */

    if (
        activities[dateKey] &&
        activities[dateKey].length > 0
    ) {

        button.classList.add(
            "has-activity"
        );

    }


    /* =====================================
       HARI INI
    ===================================== */

    const today =
        new Date();


    const todayKey =
        getDateKey(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );


    if (
        dateKey === todayKey
    ) {

        button.classList.add(
            "today"
        );

    }


    /* =====================================
       SELECTED
    ===================================== */

    if (
        dateKey === selectedDate
    ) {

        button.classList.add(
            "selected"
        );

    }


    /* =====================================
       CLICK
    ===================================== */

    button.addEventListener(
        "click",
        function () {

            selectedDate =
                dateKey;


            /*
                Kalau tanggal berasal
                dari bulan lain,
                pindahkan kalender
                ke bulan tersebut.
            */

            if (otherMonth) {

                const parts =
                    dateKey.split("-");


                currentDate =
                    new Date(
                        Number(parts[0]),
                        Number(parts[1]) - 1,
                        1
                    );

            }


            renderCalendar();

            showActivities(
                dateKey
            );

        }
    );


    calendarGrid.appendChild(
        button
    );

}


/* =========================================
   SHOW ACTIVITIES
========================================= */

function showActivities(
    dateKey
) {

    selectedDateTitle.textContent =
        formatIndonesianDate(
            dateKey
        );


    activityList.innerHTML =
        "";


    const list =
        activities[dateKey] || [];


    if (list.length === 0) {

        activityList.innerHTML = `

            <div class="empty-activity">

                Tidak ada kegiatan
                pada tanggal ini.

            </div>

        `;

        return;

    }


    list.forEach(
        activity => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "activity-card";


            card.innerHTML = `

                <h3>
                    ${escapeHTML(
                        activity.title
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        activity.description
                    )}
                </p>

            `;


            activityList.appendChild(
                card
            );

        }
    );

}


/* =========================================
   FORMAT TANGGAL INDONESIA
========================================= */

function formatIndonesianDate(
    dateKey
) {

    const parts =
        dateKey.split("-");


    const date =
        new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        );


    return date.toLocaleDateString(
        "id-ID",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(
    value
) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================
   PREVIOUS MONTH
========================================= */

prevMonth.addEventListener(
    "click",
    function () {

        currentDate.setMonth(
            currentDate.getMonth() - 1
        );


        selectedDate =
            null;


        selectedDateTitle.textContent =
            "Pilih tanggal";


        activityList.innerHTML = `

            <div class="empty-activity">

                Pilih tanggal pada kalender
                untuk melihat kegiatan.

            </div>

        `;


        renderCalendar();

    }
);


/* =========================================
   NEXT MONTH
========================================= */

nextMonth.addEventListener(
    "click",
    function () {

        currentDate.setMonth(
            currentDate.getMonth() + 1
        );


        selectedDate =
            null;


        selectedDateTitle.textContent =
            "Pilih tanggal";


        activityList.innerHTML = `

            <div class="empty-activity">

                Pilih tanggal pada kalender
                untuk melihat kegiatan.

            </div>

        `;


        renderCalendar();

    }
);


/* =========================================
   START
========================================= */

renderCalendar();
