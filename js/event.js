const API_URL =
    
"https://iroda-backend.irodapdd5.workers.dev";

// ==========================
// CEK LOGIN
// ==========================

if (localStorage.getItem("isLoggedIn") !== "true") {

window.location.href =  
    "login.html";

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
document.getElementById(
"eventModal"
);

const eventForm =
document.getElementById(
"eventForm"
);

const eventList =
document.getElementById(
"eventList"
);

const dateList =
document.getElementById(
"dateList"
);

const formMessage =
document.getElementById(
"formMessage"
);

const eventImage =
document.getElementById(
"eventImage"
);

const imagePreview =
document.getElementById(
"imagePreview"
);

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

            imagePreview.innerHTML =  
                "";  

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
        reject(new Error("File foto tidak ditemukan"));  
        return;  
    }  

    if (!file.type.startsWith("image/")) {  
        reject(new Error("File bukan gambar"));  
        return;  
    }  

    const reader = new FileReader();  

    reader.onload = function (event) {  

        const img = new Image();  

        img.onload = function () {  

            const canvas =  
                document.createElement("canvas");  

            const maxWidth = 1200;  

            let width = img.width;  
            let height = img.height;  

            if (width > maxWidth) {  

                height =  
                    height * maxWidth / width;  

                width = maxWidth;  

            }  

            canvas.width = width;  
            canvas.height = height;  

            const ctx =  
                canvas.getContext("2d");  

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

        img.onerror = function () {  

            reject(  
                new Error(  
                    "File gambar tidak dapat dibaca"  
                )  
            );  

        };  

        img.src = event.target.result;  

    };  

    reader.onerror = function () {  

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


    eventList.innerHTML =  
        "";  


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
                        ${escapeHTML(  
                            event.year  
                        )}  
                    </span>  

                    <h3>  
                        ${escapeHTML(  
                            event.name  
                        )}  
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
                        class="delete-button"  
                        onclick="deleteEvent(${event.id})"  
                    >  
                        Hapus  
                    </button>  

                </div>  

            `;  


            eventList.appendChild(  
                card  
            );  

        }  
    );  


} catch (error) {  

    console.error(error);  


    eventList.innerHTML =  
        `<div class="empty">  
            Gagal memuat event.  
        </div>`;  

}

}

// ==========================
// TAMBAH EVENT
// ==========================

document
.getElementById(
"addEventButton"
)
.addEventListener(
"click",
function () {

eventForm.reset();  


        document.getElementById(  
            "year"  
        ).value =  
            new Date()  
                .getFullYear();  


        dateList.innerHTML =  
            "";  


        imagePreview.innerHTML =  
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
.getElementById(
"closeModal"
)
.addEventListener(
"click",
closeModal
);

document
.getElementById(
"cancelButton"
)
.addEventListener(
"click",
closeModal
);

// ==========================
// TAMBAH BARIS TANGGAL
// ==========================

function addDateRow() {

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
        required  
    >  


    <input  
        type="url"  
        class="drive-link"  
        placeholder="https://drive.google.com/..."  
        required  
    >  


    <button  
        type="button"  
        class="remove-date"  
    >  
        ×  
    </button>  

`;  


row  
    .querySelector(  
        ".remove-date"  
    )  
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
.getElementById(
"addDateButton"
)
.addEventListener(
"click",
addDateRow
);

// ==========================
// SUBMIT EVENT
// ==========================

eventForm.addEventListener(
"submit",
async function (event) {

event.preventDefault();  


    formMessage.textContent =  
        "Menyimpan event...";  


    formMessage.style.color =  
        "#28594b";  


    // ======================  
    // DATA EVENT  
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


    if (!file) {  

        formMessage.textContent =  
            "Foto kegiatan wajib dipilih.";  

        formMessage.style.color =  
            "#b33a3a";  

        return;  

    }  


    // ======================  
    // KOMPRES FOTO  
    // ======================  

    let image;  


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


    // ======================  
    // TANGGAL  
    // ======================  

    const rows =  
        dateList.querySelectorAll(  
            ".date-row"  
        );  


    const dates =  
        [];  


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
    // VALIDASI TANGGAL  
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
    // KIRIM KE API  
    // ======================  

    try {  

        const response =  
            await fetch(  
                `${API_URL}/events`,  
                {  

                    method:  
                        "POST",  

                    headers: {  

                        "Content-Type":  
                            "application/json"  

                    },  

                    body:  
                        JSON.stringify({  

                            year:  
                                Number(  
                                    year  
                                ),  

                            name:  
                                name,  

                            description:  
                                description,  

                            image:  
                                image,  

                            dates:  
                                dates  

                        })  

                }  
            );  


        const data =  
            await response.json();  


        // ==================  
        // HASIL  
        // ==================  

        if (  
            !data.success  
        ) {  

            formMessage.textContent =  
                data.message ||  
                "Gagal menyimpan event.";  

            formMessage.style.color =  
                "#b33a3a";  

            return;  

        }  


        formMessage.textContent =  
            "Event berhasil dibuat!";  


        formMessage.style.color =  
            "#28594b";  


        setTimeout(  
            () => {  

                closeModal();  

                loadEvents();  

            },  
            500  
        );  


    } catch (error) {  

        console.error(  
            error  
        );  


        formMessage.textContent =  
            "Tidak dapat terhubung ke server.";  

        formMessage.style.color =  
            "#b33a3a";  

    }  

}

);

// ==========================
// LIHAT EVENT
// ==========================

function viewEvent(id) {

window.location.href =  
    `event-detail.html?id=${id}`;

}

// ==========================
// DELETE EVENT
// ==========================

async function deleteEvent(id) {

const confirmDelete =  
    confirm(  
        "Yakin ingin menghapus event ini?"  
    );  


if (!confirmDelete) {  

    return;  

}  


try {  

    const response =  
        await fetch(  
            `${API_URL}/events/${id}`,  
            {  

                method:  
                    "DELETE"  

            }  
        );  


    const data =  
        await response.json();  


    if (  
        !data.success  
    ) {  

        alert(  
            data.message ||  
            "Gagal menghapus event."  
        );  

        return;  

    }  


    alert(  
        "Event berhasil dihapus."  
    );  


    loadEvents();  


} catch (error) {  

    console.error(  
        error  
    );  


    alert(  
        "Tidak dapat terhubung ke server."  
    );  

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

function escapeHTML(value) {

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

document
.getElementById(
"logoutButton"
)
.addEventListener(
"click",
function () {

localStorage.removeItem(  
            "isLoggedIn"  
        );  


        localStorage.removeItem(  
            "admin"  
        );  


        window.location.href =  
            "login.html";  

    }  
);

// ==========================
// MULAI
// ==========================

loadEvents();

mending kamu updatein sesuai yg kamu suruh itu aku bingung
