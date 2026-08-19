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

    const admin =
        JSON.parse(adminData);


    document.getElementById(
        "adminName"
    ).textContent =
        admin.name || "Admin";


    document.getElementById(
        "avatar"
    ).textContent =
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

const currentImage =
    document.getElementById("currentImage");

const currentImagePreview =
    document.getElementById("currentImagePreview");

const removeImage =
    document.getElementById("removeImage");

const modalTitle =
    document.getElementById("modalTitle");

const modalSubtitle =
    document.getElementById("modalSubtitle");

const saveButtonText =
    document.getElementById("saveButtonText");

const eventIdInput =
    document.getElementById("eventId");


// ==========================
// MODE
// ==========================

let editMode = false;

let oldImage = "";


// ==========================
// PREVIEW FOTO BARU
// ==========================

eventImage.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];


        imagePreview.innerHTML = "";


        if (!file) {
            return;
        }


        const reader =
            new FileReader();


        reader.onload =
            function (e) {

                imagePreview.innerHTML = `

                    <img
                        src="${e.target.result}"
                        alt="Preview Foto Baru"
                        style="
                            width:100%;
                            max-width:500px;
                            height:260px;
                            object-fit:cover;
                            border-radius:12px;
                            margin-top:12px;
                        "
                    >

                    <small
                        style="
                            display:block;
                            margin-top:6px;
                        "
                    >
                        Foto baru akan menggantikan foto lama.
                    </small>

                `;

            };


        reader.readAsDataURL(file);

    }
);


// ==========================
// KOMPRES FOTO
// ==========================

function compressImage(file) {

    return new Promise(
        (resolve, reject) => {

            if (!file) {

                reject(
                    new Error(
                        "File foto tidak ditemukan"
                    )
                );

                return;
            }


            if (
                !file.type.startsWith("image/")
            ) {

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


                            const maxWidth =
                                1200;


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

        }
    );

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
                data.message ||
                "Gagal mengambil event"
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


        eventList.innerHTML = `

            <div class="empty">

                Gagal memuat event.

                <br>

                <small>
                    ${escapeHTML(error.message)}
                </small>

            </div>

        `;

    }

}


// ==========================
// BUKA MODAL TAMBAH
// ==========================

document
    .getElementById("addEventButton")
    .addEventListener(
        "click",
        function () {

            editMode = false;

            oldImage = "";


            eventForm.reset();


            eventIdInput.value = "";


            document.getElementById(
                "year"
            ).value =
                new Date().getFullYear();


            modalTitle.textContent =
                "Tambah Event";


            modalSubtitle.textContent =
                "Buat dokumentasi kegiatan baru.";


            saveButtonText.textContent =
                "Simpan Event";


            currentImage.style.display =
                "none";


            currentImagePreview.src =
                "";


            removeImage.checked =
                false;


            imagePreview.innerHTML =
                "";


            dateList.innerHTML =
                "";


            addDateRow();


            formMessage.textContent =
                "";


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
    dateValue = "",
    linkValue = ""
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
            value="${escapeHTML(dateValue)}"
            required
        >


        <input
            type="url"
            class="drive-link"
            value="${escapeHTML(linkValue)}"
            placeholder="https://drive.google.com/..."
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

                    alert(
                        "Minimal satu tanggal harus ada."
                    );

                    return;

                }


                row.remove();

            }
        );


    dateList.appendChild(row);

}


// ==========================
// TOMBOL TAMBAH TANGGAL
// ==========================

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

    formMessage.textContent =
        "Memuat data event...";


    try {

        const response =
            await fetch(
                `${API_URL}/events/${id}`
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


        editMode = true;


        eventIdInput.value =
            event.id;


        oldImage =
            event.image || "";


        document.getElementById(
            "year"
        ).value =
            event.year || "";


        document.getElementById(
            "name"
        ).value =
            event.name || "";


        document.getElementById(
            "description"
        ).value =
            event.description || "";


        eventImage.value =
            "";


        imagePreview.innerHTML =
            "";


        removeImage.checked =
            false;


        // FOTO LAMA

        if (oldImage) {

            currentImage.style.display =
                "block";


            currentImagePreview.src =
                oldImage;

        } else {

            currentImage.style.display =
                "none";


            currentImagePreview.src =
                "";

        }


        // TANGGAL

        dateList.innerHTML =
            "";


        if (dates.length > 0) {

            dates.forEach(
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


        modalTitle.textContent =
            "Edit Event";


        modalSubtitle.textContent =
            "Perbarui data dokumentasi kegiatan.";


        saveButtonText.textContent =
            "Simpan Perubahan";


        formMessage.textContent =
            "";


        eventModal.classList.add(
            "show"
        );


    } catch (error) {

        console.error(error);


        alert(
            error.message ||
            "Gagal memuat event."
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
            editMode
                ? "Menyimpan perubahan..."
                : "Menyimpan event...";


        formMessage.style.color =
            "#28594b";


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
        // FOTO
        // ======================

        let image =
            oldImage;


        const file =
            eventImage.files[0];


        // FOTO BARU DIPILIH

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


        // ======================
        // HAPUS FOTO LAMA
        // ======================

        if (
            editMode &&
            removeImage.checked &&
            !file
        ) {

            image = "";

        }


        // ======================
        // REQUEST
        // ======================

        try {

            const url =
                editMode
                    ? `${API_URL}/events/${eventIdInput.value}`
                    : `${API_URL}/events`;


            const method =
                editMode
                    ? "PUT"
                    : "POST";


       
