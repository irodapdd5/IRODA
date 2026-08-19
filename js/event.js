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

    const admin = JSON.parse(adminData);

    document.getElementById("adminName").textContent =
        admin.name || "Admin";

    document.getElementById("avatar").textContent =
        (admin.name || "A")
            .charAt(0)
            .toUpperCase();
}


// ==========================
// ELEMENT
// ==========================

const eventModal =
    document.getElementById("eventModal");

const eventForm =
    document.getElementById("eventForm");

const eventList =
    document.getElementById("eventList");

const dateList =
    document.getElementById("dateList");

const formMessage =
    document.getElementById("formMessage");

const eventImage =
    document.getElementById("eventImage");

const imagePreview =
    document.getElementById("imagePreview");


// ==========================
// MODE EDIT
// ==========================

let editingEventId = null;

let currentEventImage = null;


// ==========================
// PREVIEW FOTO
// ==========================

if (eventImage) {

    eventImage.addEventListener(
        "change",
        function () {

            const file =
                this.files[0];

            if (!file) {

                if (currentEventImage) {

                    imagePreview.innerHTML = `

                        <img
                            src="${currentEventImage}"
                            alt="Foto Event"
                            style="
                                width:100%;
                                max-width:500px;
                                height:260px;
                                object-fit:cover;
                                border-radius:12px;
                                margin-top:12px;
                            "
                        >

                    `;

                } else {

                    imagePreview.innerHTML = "";

                }

                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function (e) {

                    imagePreview.innerHTML = `

                        <img
                            src="${e.target.result}"
                            alt="Preview Foto"
                            style="
                                width:100%;
                                max-width:500px;
                                height:260px;
                                object-fit:cover;
                                border-radius:12px;
                                margin-top:12px;
                            "
                        >

                    `;

                };


            reader.readAsDataURL(file);

        }
    );

}


// ==========================
// KOMPRES FOTO
// ==========================

function compressImage(file) {

    return new Promise((resolve, reject) => {

        if (!file) {

            reject(
                new Error(
                    "File foto tidak ditemukan"
                )
            );

            return;
        }


        if (!file.type.startsWith("image/")) {

            reject(
                new Error(
                    "File bukan gambar"
                )
            );

            return;
        }


        const reader =
            new FileReader();


        reader.onload =
            function (event) {

                const img =
                    new Image();


                img.onload =
                    function () {

                        const canvas =
                            document.createElement(
                                "canvas"
                            );


                        const maxWidth = 1200;


                        let width =
                            img.width;

                        let height =
                            img.height;


                        if (
                            width > maxWidth
                        ) {

                            height =
                                height *
                                maxWidth /
                                width;

                            width =
                                maxWidth;

                        }


                        canvas.width =
                            width;

                        canvas.height =
                            height;


                        const ctx =
                            canvas.getContext(
                                "2d"
                            );


                        if (!ctx) {

                            reject(
                                new Error(
                                    "Canvas tidak dapat dibuat"
                                )
                            );

                            return;
                        }


                        ctx.drawImage(
                            img,
                            0,
                            0,
                            width,
                            height
                        );


                        canvas.toBlob(
                            function (blob) {

                                if (!blob) {

                                    reject(
                                        new Error(
                                            "Foto gagal dikompres"
                                        )
                                    );

                                    return;
                                }


                                const readerBlob =
                                    new FileReader();


                                readerBlob.onload =
                                    function () {

                                        resolve(
                                            readerBlob.result
                                        );

                                    };


                                readerBlob.onerror =
                                    function () {

                                        reject(
                                            new Error(
                                                "Foto gagal dibaca"
                                            )
                                        );

                                    };


                                readerBlob.readAsDataURL(
                                    blob
                                );

                            },
                            "image/jpeg",
                            0.70
                        );

                    };


                img.onerror =
                    function () {

                        reject(
                            new Error(
                                "File gambar tidak dapat dibaca"
                            )
                        );

                    };


                img.src =
                    event.target.result;

            };


        reader.onerror =
            function () {

                reject(
                    new Error(
                        "File tidak dapat dibaca"
                    )
                );

            };


        reader.readAsDataURL(file);

    });

}


// ==========================
// LOAD EVENTS
// ==========================

async function loadEvents() {

    eventList.innerHTML =
        '<div class="loading">Memuat event...</div>';


    try {

        const response =
            await fetch(
                `${API_URL}/events`
            );


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message
            );

        }


        if (
            !data.data ||
            data.data.length === 0
        ) {

            eventList.innerHTML =
                '<div class="empty">Belum ada event.</div>';

            return;
        }


        eventList.innerHTML = "";


        data.data.forEach(
            event => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "event-card";


                const dateText =
                    event.first_date
                        ? formatDate(
                            event.first_date
                        )
                        : "Belum ada tanggal";


                card.innerHTML = `

                    <div class="event-info">

                        <span class="event-year">
                            ${escapeHTML(event.year)}
                        </span>

                        <h3>
                            ${escapeHTML(event.name)}
                        </h3>

                        <p>
                            ${dateText}
                        </p>

                    </div>


                    <div class="event-actions">

                        <button
                            class="view-button"
                            onclick="viewEvent(${event.id})"
                        >
                            Lihat
                        </button>


                        <button
                            class="edit-button"
                            onclick="editEvent(${event.id})"
                        >
                            Edit
                        </button>


                        <button
                            class="delete-button"
                            onclick="deleteEvent(${event.id})"
                        >
                            Hapus
                        </button>

                    </div>

                `;


                eventList.appendChild(card);

            }
        );


    } catch (error) {

        console.error(error);


        eventList.innerHTML =
            `
            <div class="empty">
                Gagal memuat event.
            </div>
            `;

    }

}


// ==========================
// TAMBAH EVENT
// ==========================

document
    .getElementById("addEventButton")
    .addEventListener(
        "click",
        function () {

            editingEventId = null;

            currentEventImage = null;


            eventForm.reset();


            document.getElementById("year").value =
                new Date().getFullYear();


            dateList.innerHTML = "";

            imagePreview.innerHTML = "";

            formMessage.textContent = "";


            addDateRow();


            const modalTitle =
                eventModal.querySelector(
                    ".modal-header h2"
                );


            const modalDescription =
                eventModal.querySelector(
                    ".modal-header p"
                );


            modalTitle.textContent =
                "Tambah Event";

            modalDescription.textContent =
                "Buat dokumentasi kegiatan baru.";


            const submitButton =
                eventForm.querySelector(
                    'button[type="submit"]'
                );


            submitButton.textContent =
                "Simpan Event";


            eventModal.classList.add(
                "show"
            );

        }
    );


// ==========================
// TUTUP MODAL
// ==========================

function closeModal() {

    eventModal.classList.remove(
        "show"
    );

    editingEventId = null;

    currentEventImage = null;

}


document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        closeModal
    );


document
    .getElementById("cancelButton")
    .addEventListener(
        "click",
        closeModal
    );


// ==========================
// TAMBAH BARIS TANGGAL
// ==========================

function addDateRow(
    eventDate = "",
    driveLink = ""
) {

    const row =
        document.createElement(
            "div"
        );


    row.className =
        "date-row";


    row.innerHTML = `

        <input
            type="date"
            class="event-date"
            value="${escapeHTML(eventDate)}"
            required
        >


        <input
            type="url"
            class="drive-link"
            placeholder="https://drive.google.com/..."
            value="${escapeHTML(driveLink)}"
            required
        >


        <button
            type="button"
            class="remove-date"
            title="Hapus tanggal"
        >
            ×
        </button>

    `;


    row
        .querySelector(".remove-date")
        .addEventListener(
            "click",
            function () {

                const rows =
                    dateList.querySelectorAll(
                        ".date-row"
                    );


                if (
                    rows.length <= 1
                ) {

                    return;

                }


                row.remove();

            }
        );


    dateList.appendChild(
        row
    );

}


document
    .getElementById("addDateButton")
    .addEventListener(
        "click",
        function () {

            addDateRow();

        }
    );


// ==========================
// EDIT EVENT
// ==========================

async function editEvent(id) {

    try {

        formMessage.textContent =
            "Memuat event...";


        const response =
            await fetch(
                `${API_URL}/events/${id}`
            );


        const data =
            await response.json();


        if (!data.success) {

            alert(
                data.message ||
                "Gagal mengambil event."
            );

            return;
        }


        const event =
            data.event;


        editingEventId =
            id;


        currentEventImage =
            event.image || null;


        // ======================
        // DATA UTAMA
        // ======================

        document.getElementById("year").value =
            event.year;


        document.getElementById("name").value =
            event.name;


        document.getElementById("description").value =
            event.description || "";


        // ======================
        // TANGGAL
        // ======================

        dateList.innerHTML = "";


        if (
            event.dates &&
            event.dates.length > 0
        ) {

            event.dates.forEach(
                date => {

                    addDateRow(
                        date.event_date,
                        date.drive_link
                    );

                }
            );

        } else {

            addDateRow();

        }


        // ======================
        // FOTO
        // ======================

        eventImage.value = "";


        if (event.image) {

            imagePreview.innerHTML = `

                <img
                    src="${event.image}"
                    alt="Foto Event"
                    style="
                        width:100%;
                        max-width:500px;
                        height:260px;
                        object-fit:cover;
                        border-radius:12px;
                        margin-top:12px;
                    "
                >

                <small>
                    Pilih foto baru jika ingin mengganti foto.
                </small>

            `;

        } else {

            imagePreview.innerHTML = "";

        }


        // ======================
        // JUDUL MODAL
        // ======================

        eventModal
            .querySelector(
                ".modal-header h2"
            )
            .textContent =
                "Edit Event";


        eventModal
            .querySelector(
                ".modal-header p"
            )
            .textContent =
                "Ubah dokumentasi kegiatan.";


        // ======================
        // TOMBOL
        // ======================

        eventForm
            .querySelector(
                'button[type="submit"]'
            )
            .textContent =
                "Simpan Perubahan";


        formMessage.textContent = "";


        eventModal.classList.add(
            "show"
        );


    } catch (error) {

        console.error(error);


        alert(
            "Tidak dapat mengambil data event."
        );

    }

}


// ==========================
// SUBMIT EVENT
// ==========================

eventForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        formMessage.textContent =
            editingEventId
                ? "Menyimpan perubahan..."
                : "Menyimpan event...";


        formMessage.style.color =
            "#28594b";


        // ======================
        // DATA
        // ======================

        const year =
            document.getElementById(
                "year"
            ).value;


        const name =
            document.getElementById(
                "name"
            ).value.trim();


        const description =
            document.getElementById(
                "description"
            ).value.trim();


        // ======================
        // FOTO
        // ======================

        const file =
            eventImage.files[0];


        let image =
            currentEventImage;


        // Jika pilih foto baru
        if (file) {

            try {

                image =
                    await compressImage(
                        file
                    );

            } catch (error) {

                console.error(error);


                formMessage.textContent =
                    "Foto tidak dapat diproses.";

                formMessage.style.color =
                    "#b33a3a";

                return;

            }

        }


        // Saat tambah event,
        // foto wajib ada

        if (
            !editingEventId &&
            !image
        ) {

            formMessage.textContent =
                "Foto kegiatan wajib dipilih.";

            formMessage.style.color =
                "#b33a3a";

            return;

        }


        // ======================
        // TANGGAL
        // ======================

        const rows =
            dateList.querySelectorAll(
                ".date-row"
            );


        const dates = [];


        rows.forEach(
            row => {

                const eventDate =
                    row.querySelector(
                        ".event-date"
                    ).value;


                const driveLink =
                    row.querySelector(
                        ".drive-link"
                    ).value.trim();


                if (
                    eventDate &&
                    driveLink
                ) {

                    dates.push({

                        event_date:
                            eventDate,

                        drive_link:
                            driveLink

                    });

                }

            }
        );


        // ======================
        // VALIDASI
        // ======================

        if (
            dates.length === 0
        ) {

            formMessage.textContent =
                "Minimal satu tanggal dan link Google Drive.";

            formMessage.style.color =
                "#b33a3a";

            return;

        }


        // ======================
        // API
        // ======================

        tr
