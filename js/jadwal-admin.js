const API_URL =
    "https://iroda-backend.irodapdd5.workers.dev";

// ==========================================
// ELEMENT
// ==========================================

const scheduleTable =
    document.getElementById("scheduleTable");

const addScheduleButton =
    document.getElementById("addScheduleButton");

const scheduleModal =
    document.getElementById("scheduleModal");

const closeModal =
    document.getElementById("closeModal");

const scheduleForm =
    document.getElementById("scheduleForm");

const modalTitle =
    document.getElementById("modalTitle");

const scheduleId =
    document.getElementById("scheduleId");

const titleInput =
    document.getElementById("title");

const scheduleDateInput =
    document.getElementById("scheduleDate");

const scheduleTimeInput =
    document.getElementById("scheduleTime");

const locationInput =
    document.getElementById("location");

const descriptionInput =
    document.getElementById("description");

const saveButton =
    document.getElementById("saveButton");

const adminName =
    document.getElementById("adminName");


const avatar =
    document.getElementById("avatar");

const logoutButton =
    document.getElementById("logoutButton");


// ==========================================
// DATA
// ==========================================

let schedules = [];


// ==========================================
// CEK LOGIN
// ==========================================

const loginData =
    localStorage.getItem("admin");


if (loginData) {

    try {

        const admin =
            JSON.parse(loginData);


        if (admin && admin.name) {

            if (adminName) {

                adminName.textContent =
                    admin.name;

            }


            if (avatar) {

                avatar.textContent =
                    admin.name
                        .charAt(0)
                        .toUpperCase();

            }

        }

    } catch (error) {

        console.error(
            "Data admin tidak valid:",
            error
        );

    }

}


// ==========================================
// LOAD SCHEDULES
// ==========================================

async function loadSchedules() {

    scheduleTable.innerHTML = `
        <div class="loading">
            Memuat jadwal...
        </div>
    `;

    try {

        const response =
            await fetch(
                `${API_URL}/schedules`
            );

        console.log("STATUS API:", response.status);

        const data =
            await response.json();

        console.log("DATA API:", data);

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Gagal mengambil jadwal"
            );

        }

        schedules =
            Array.isArray(data.schedules)
                ? data.schedules
                : [];

        console.log("SCHEDULES:", schedules);

        renderSchedules();

    } catch (error) {

        console.error(
            "ERROR LOAD SCHEDULE:",
            error
        );

        scheduleTable.innerHTML = `
            <div class="empty">
                Gagal memuat jadwal.<br>
                ${error.message}
            </div>
        `;

    }

}
// ==========================================
// RENDER
// ==========================================

function renderSchedules() {

    if (schedules.length === 0) {

        scheduleTable.innerHTML = `
            <div class="empty">
                Belum ada jadwal kegiatan.
            </div>
        `;

        return;
    }


    let html = `

        <table>

            <thead>

                <tr>

                    <th>
                        Tanggal
                    </th>

                    <th>
                        Jam
                    </th>

                    <th>
                        Kegiatan
                    </th>

                    <th>
                        Lokasi
                    </th>

                    <th>
                        Aksi
                    </th>

                </tr>

            </thead>

            <tbody>
    `;


    schedules.forEach(schedule => {

        html += `

            <tr>

                <td>
                    ${formatDate(schedule.schedule_date)}
                </td>

                <td>
                    ${
                        escapeHTML(
                            schedule.schedule_time ||
                            "-"
                        )
                    }
                </td>

                <td>

                    <div class="schedule-title">

                        ${escapeHTML(schedule.title)}

                    </div>


                    ${
                        schedule.description
                            ? `
                                <div class="schedule-description">
                                    ${escapeHTML(schedule.description)}
                                </div>
                            `
                            : ""
                    }

                </td>

                <td>

                    ${
                        escapeHTML(
                            schedule.location ||
                            "-"
                        )
                    }

                </td>

                <td>

                    <div class="actions">

                        <button
                            type="button"
                            class="action-button edit-button"
                            onclick="editSchedule(${schedule.id})"
                            title="Edit"
                        >

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        <button
                            type="button"
                            class="action-button delete-button"
                            onclick="deleteSchedule(${schedule.id})"
                            title="Hapus"
                        >

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            </tr>

        `;

    });


    html += `

            </tbody>

        </table>

    `;


    scheduleTable.innerHTML =
        html;

}


// ==========================================
// FORMAT TANGGAL
// ==========================================

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }


    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    const div =
        document.createElement("div");


    div.textContent =
        String(value);


    return div.innerHTML;

}


// ==========================================
// BUKA MODAL TAMBAH
// ==========================================

addScheduleButton.addEventListener(
    "click",
    () => {

        scheduleForm.reset();

        scheduleId.value = "";

        modalTitle.textContent =
            "Tambah Jadwal";

        saveButton.innerHTML = `
            <i class="fa-solid fa-floppy-disk"></i>
            Simpan
        `;

        scheduleModal.hidden = false;

    }
);


// ==========================================
// TUTUP MODAL
// ==========================================

function closeScheduleModal() {

    scheduleModal.hidden = true;

}


closeModal.addEventListener(
    "click",
    closeScheduleModal
);


document.querySelector(
    ".modal-overlay"
).addEventListener(
    "click",
    closeScheduleModal
);


// ==========================================
// EDIT
// ==========================================

window.editSchedule =
    function(id) {

        const schedule =
            schedules.find(
                item =>
                    Number(item.id) === Number(id)
            );


        if (!schedule) {

            alert(
                "Jadwal tidak ditemukan."
            );

            return;

        }


        scheduleId.value =
            schedule.id;

        titleInput.value =
            schedule.title || "";

        scheduleDateInput.value =
            schedule.schedule_date || "";

        scheduleTimeInput.value =
            schedule.schedule_time || "";

        locationInput.value =
            schedule.location || "";

        descriptionInput.value =
            schedule.description || "";


        modalTitle.textContent =
            "Edit Jadwal";


        saveButton.innerHTML = `
            <i class="fa-solid fa-floppy-disk"></i>
            Simpan Perubahan
        `;


        scheduleModal.hidden =
            false;

    };


// ==========================================
// SIMPAN
// ==========================================

scheduleForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const id =
            scheduleId.value;


        const payload = {

            title:
                titleInput.value.trim(),

            schedule_date:
                scheduleDateInput.value,

            schedule_time:
                scheduleTimeInput.value,

            location:
                locationInput.value.trim(),

            description:
                descriptionInput.value.trim()

        };


        if (
            !payload.title ||
            !payload.schedule_date
        ) {

            alert(
                "Judul dan tanggal wajib diisi."
            );

            return;

        }


        const isEdit =
            Boolean(id);


        const url =
            isEdit
                ? `${API_URL}/schedules/${id}`
                : `${API_URL}/schedules`;


        const method =
            isEdit
                ? "PUT"
                : "POST";


        saveButton.disabled =
            true;

        saveButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Menyimpan...
        `;


        try {

            const response =
                await fetch(
                    url,
                    {
                        method,
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body:
                            JSON.stringify(payload)
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Gagal menyimpan jadwal"
                );

            }


            alert(
                data.message ||
                "Jadwal berhasil disimpan."
            );


            closeScheduleModal();

            await loadSchedules();

        } catch (error) {

            console.error(error);

            alert(
                error.message ||
                "Terjadi kesalahan."
            );

        } finally {

            saveButton.disabled =
                false;

            saveButton.innerHTML = `
                <i class="fa-solid fa-floppy-disk"></i>
                ${
                    isEdit
                        ? "Simpan Perubahan"
                        : "Simpan"
                }
            `;

        }

    }
);


// ==========================================
// DELETE
// ==========================================

window.deleteSchedule =
    async function(id) {

        const schedule =
            schedules.find(
                item =>
                    Number(item.id) === Number(id)
            );


        if (!schedule) {

            alert(
                "Jadwal tidak ditemukan."
            );

            return;

        }


        const confirmed =
            confirm(
                `Hapus jadwal "${schedule.title}"?`
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/schedules/${id}`,
                    {
                        method: "DELETE"
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Gagal menghapus jadwal"
                );

            }


            alert(
                data.message ||
                "Jadwal berhasil dihapus."
            );


            await loadSchedules();

        } catch (error) {

            console.error(error);

            alert(
                error.message ||
                "Terjadi kesalahan."
            );

        }

    };


// ==========================================
// LOGOUT
// ==========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "admin"
            );

            localStorage.removeItem(
                "login"
            );

            window.location.href =
                "login.html";

        }
    );

}


// ==========================================
// LOAD AWAL
// ==========================================

loadSchedules();
