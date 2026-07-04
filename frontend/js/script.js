let originalBuffer = null;
let originalFileName = "";
let parsedData = [];
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Đổi Theme (Dark Mode / Light Mode)
const themeToggleBtn = document.getElementById("themeToggle");
let isDarkMode = true;

themeToggleBtn.addEventListener("click", () => {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        document.documentElement.setAttribute("data-theme", "dark");
        themeToggleBtn.textContent = "☀️";
    } else {
        document.documentElement.removeAttribute("data-theme");
        themeToggleBtn.textContent = "🌙";
    }
});

// Lấy các element nút bấm để quản lý trạng thái disabled
const btnSaveDraft = document.getElementById("btnSaveDraft");
const btnSave = document.getElementById("btnSave");

// Mặc định ban đầu khi chưa có file thì khóa các nút xuất dữ liệu lại
btnSaveDraft.disabled = true;
btnSave.disabled = true;

// 1. Đọc File .dat gốc
document.getElementById("fileInput").addEventListener("change", async function (e) {
    const file = e.target.files[0];
    if (!file) return;
    originalFileName = file.name;

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = new Uint8Array(arrayBuffer);

    parseBinary(originalBuffer);
    renderTable();
    updateProgressBar();

    // Load file gốc thành công -> Bỏ disabled cho cả 2 nút Lưu Nháp và Đóng Gói
    btnSaveDraft.disabled = false;
    btnSave.disabled = false;

    e.target.value = null;
});

// 2. Đọc File Bản nháp .json
document.getElementById("fileJsonInput").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!originalBuffer) {
        alert("Vui lòng mở file gốc (.dat) trước khi nạp bản nháp!");
        e.target.value = null;
        return;
    }

    const reader = new FileReader();
    reader.onload = function (evt) {
        try {
            const imported = JSON.parse(evt.target.result);
            const rows = Array.isArray(imported) ? imported : imported.data;

            if (!rows || !Array.isArray(rows)) {
                throw new Error();
            }

            parsedData.forEach((item) => {
                const match = rows.find((r) => r.offset === item.offset);
                if (match) {
                    item.translated = match.translated || "";
                }
            });

            renderTable();
            updateProgressBar();
        } catch (err) {
            alert("File nháp không đúng định dạng hoặc bị lỗi!");
        }
    };
    reader.readAsText(file);
    e.target.value = null;
});

// Bóc tách nhị phân
function parseBinary(buffer) {
    parsedData = [];
    let currentBytes = [];
    let startOffset = -1;

    for (let i = 0; i < buffer.length; i++) {
        const byte = buffer[i];
        if (byte >= 0x20 || byte === 0x0a || byte === 0x0d) {
            if (currentBytes.length === 0) startOffset = i;
            currentBytes.push(byte);
        } else {
            if (currentBytes.length > 3) {
                const text = decoder.decode(new Uint8Array(currentBytes));
                parsedData.push({
                    offset: startOffset,
                    maxLength: currentBytes.length,
                    original: text,
                    translated: "",
                });
            }
            currentBytes = [];
        }
    }
}

// Render Giao Diện Bảng (DOM thuần)
function renderTable() {
    const tbody = document.getElementById("tbody");
    tbody.innerHTML = "";

    if (parsedData.length === 0) {
        tbody.innerHTML = `<tr id="emptyState"><td colspan="6" class="empty-state">Vui lòng mở file gốc (.dat) hoặc bản nháp (.json) để bắt đầu dịch.</td></tr>`;
        return;
    }

    parsedData.forEach((item, index) => {
        const tr = document.createElement("tr");
        tr.id = `row_${index}`;

        tr.innerHTML = `
            <td style="text-align: center; color: var(--text-muted); font-weight: 600;">${index + 1}</td>
            <td style="text-align: center; color: var(--text-muted); font-family: monospace; font-size: 12px;">0x${item.offset.toString(16).toUpperCase()}</td>
            <td>
                <textarea class="textarea-box textarea-original" readonly>${item.original}</textarea>
            </td>
            <td>
                <button class="btn-translate" id="btn_translate_${index}" title="Dịch bằng Google">
                    <svg viewBox="0 0 48 48" class="w-5 h-5 mx-auto" width="16" height="16" fill="currentColor">
                        <path fill="#ee7575" d="M37.5 10h-13l-1.5-6h-17v34h19l1.5 6h21v-34z"/>
                        <path fill="#FFF" d="M14.4 23.3c-4.4 0-8.1-3.6-8.1-8.1s3.6-8.1 8.1-8.1c2.1 0 4 .8 5.5 2.1l-2.4 2.3c-.6-.6-1.7-1.2-3.1-1.2-2.7 0-4.8 2.2-4.8 4.9s2.1 4.9 4.8 4.9c3 0 4.1-2.1 4.3-3.2h-4.3v-3.1h7.5c.1.5.2 1.1.2 1.8 0 3.8-2.6 6.7-7.7 6.7zM31 31.9l-2.4-2.4c-1.3 1.5-2.8 2.8-4.4 3.7l1.1 2.9c2-.9 3.9-2.4 5.7-4.2zm6.7.1l-6-6-1.5 1.5 2.7 2.7c-1.7 1.9-3.7 3.4-5.9 4.5l1.2 2.9c2.5-1.2 4.8-2.9 6.8-5l2.7 2.7 1.5-1.5c-1-1.1-2-2.1-3-3z"/>
                        <path fill="#FFF" d="M26.2 17.5h6.3v-2.5h-4.1l-.8-2.5h-2.5l3.8 11.2h2.9l3.8-11.2h-2.9l-2.2 6.5-1.1-3.2z"/>
                    </svg>
                </button>
            </td>
            <td>
                <textarea class="textarea-box textarea-translate" id="textarea_${index}" placeholder="Nhập bản dịch...">${item.translated}</textarea>
            </td>
            <td id="status_${index}"></td>
        `;
        tbody.appendChild(tr);

        // Sự kiện gõ chữ tính toán số lượng byte
        const textarea = tr.querySelector(`#textarea_${index}`);
        textarea.addEventListener("input", function () {
            updateText(index, this.value);
            updateProgressBar();
        });

        // Sự kiện click nút dịch Google
        const btnTranslate = tr.querySelector(`#btn_translate_${index}`);
        btnTranslate.addEventListener("click", function () {
            translateSingleRow(index);
        });

        updateText(index, item.translated);
    });
}

// Tính toán hiển thị số lượng câu và byte
function updateText(index, value) {
    parsedData[index].translated = value;
    const currentBytes = value === "" ? 0 : encoder.encode(value).length;
    const maxBytes = parsedData[index].maxLength;

    const statusTd = document.getElementById(`status_${index}`);
    const row = document.getElementById(`row_${index}`);

    if (value === "") {
        statusTd.innerHTML = `<div class="status-box untranslated">Chưa dịch<br>Tối đa: ${maxBytes}</div>`;
        row.classList.remove("row-error");
    } else if (currentBytes > maxBytes) {
        statusTd.innerHTML = `
            <div class="status-box error">
                Vượt giới hạn<br>${currentBytes}/${maxBytes}
                <span class="status-badge badge-error">Thừa ${currentBytes - maxBytes} byte</span>
            </div>`;
        row.classList.add("row-error");
    } else {
        statusTd.innerHTML = `
            <div class="status-box valid">
                Hợp lệ<br>${currentBytes}/${maxBytes}
                <span class="status-badge badge-valid">Còn ${maxBytes - currentBytes} byte</span>
            </div>`;
        row.classList.remove("row-error");
    }
}

// Cập nhật tiến độ trên Topbar
function updateProgressBar() {
    const total = parsedData.length;
    if (total === 0) return;

    const translatedCount = parsedData.filter((item) => item.translated.trim() !== "").length;
    const percentage = Math.round((translatedCount / total) * 100);

    document.getElementById("translatedCount").textContent = translatedCount;
    document.getElementById("totalCount").textContent = total;
    document.getElementById("progressPercent").textContent = `${percentage}%`;
    document.getElementById("progressFill").style.width = `${percentage}%`;
}

// Gọi API dịch Google theo cổng localhost:3333 của cậu
async function translateSingleRow(index) {
    const originalText = parsedData[index].original;
    const btnTranslate = document.getElementById(`btn_translate_${index}`);
    const textarea = document.getElementById(`textarea_${index}`);

    if (/^[a-zA-Z0-9_]+$/.test(originalText.trim())) {
        textarea.value = originalText;
        updateText(index, originalText);
        updateProgressBar();
        return;
    }

    const sourceSelect = document.getElementById("sourceLang");
    const targetSelect = document.getElementById("targetLang");

    btnTranslate.disabled = true;
    const originalBtnHTML = btnTranslate.innerHTML;
    btnTranslate.innerHTML = `<div class="spinner"></div>`;

    try {
        const response = await fetch("http://localhost:3333/api/translate/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: originalText,
                sourceLangCode: sourceSelect.value,
                sourceLangName:
                    sourceSelect.options[sourceSelect.selectedIndex].getAttribute("data-name"),
                targetLangCode: targetSelect.value,
                targetLangName:
                    targetSelect.options[targetSelect.selectedIndex].getAttribute("data-name"),
            }),
        });

        const data = await response.json();

        if (data.success) {
            parsedData[index].translated = data.translatedText;
            textarea.value = data.translatedText;
            updateText(index, data.translatedText);
            updateProgressBar();
        } else {
            alert(`Lỗi từ máy chủ: ${data.message}`);
        }
    } catch (error) {
        console.error(error);
        alert("Không thể kết nối đến máy chủ dịch thuật ở cổng 3333.");
    } finally {
        btnTranslate.disabled = false;
        btnTranslate.innerHTML = originalBtnHTML;
    }
}

// Lọc tìm kiếm thời gian thực
document.getElementById("searchBox").addEventListener("input", function () {
    const query = this.value.toLowerCase();
    parsedData.forEach((item, index) => {
        const row = document.getElementById(`row_${index}`);
        if (row) {
            const text = item.original.toLowerCase();
            row.style.display = text.includes(query) ? "" : "none";
        }
    });
});

// Gửi yêu cầu lưu file nháp tiến độ về /api/save/draft của Backend
btnSaveDraft.addEventListener("click", async function () {
    if (parsedData.length === 0) {
        alert("Không có dữ liệu tiến độ để thực hiện lưu bản nháp!");
        return;
    }
    const exportPath = document.getElementById("exportPath").value.trim();
    if (!exportPath) {
        alert("Vui lòng nhập đường dẫn thư mục để tiến hành lưu bản nháp!");
        document.getElementById("exportPath").focus();
        return;
    }

    const originalBtnText = btnSaveDraft.innerHTML;
    btnSaveDraft.disabled = true;
    btnSaveDraft.innerHTML = "<span>💾 Đang lưu...</span>";

    try {
        const response = await fetch("http://localhost:3333/api/save/draft", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                folderPath: exportPath,
                draftFileName: `draft_${originalFileName || "progress"}.json`,
                draftData: {
                    originalFileName: originalFileName,
                    sourceLangCode: document.getElementById("sourceLang").value,
                    targetLangCode: document.getElementById("targetLang").value,
                    originalBuffer: Array.from(originalBuffer),
                    data: parsedData,
                },
            }),
        });
        const result = await response.json();
        if (result.success) {
            alert("Lưu bản nháp tiến độ thành công!");
        } else {
            alert("Lỗi: " + result.message);
        }
    } catch (err) {
        alert("Không thể kết nối đến server để lưu nháp.");
    }
    {
        btnSaveDraft.disabled = false;
        btnSaveDraft.innerHTML = originalBtnText;
    }
});

// Gửi yêu cầu đóng gói về /api/save/file của Backend
btnSave.addEventListener("click", async function () {
    const exportPath = document.getElementById("exportPath").value.trim();
    if (!exportPath) {
        alert("Vui lòng điền đường dẫn thư mục muốn lưu file!");
        document.getElementById("exportPath").focus();
        return;
    }

    const firstErrorIndex = parsedData.findIndex((item) => {
        if (!item.translated) return false;
        return encoder.encode(item.translated).length > item.maxLength;
    });

    if (firstErrorIndex !== -1) {
        const errorRow = document.getElementById(`row_${firstErrorIndex}`);
        const errorTextarea = document.getElementById(`textarea_${firstErrorIndex}`);

        errorRow.style.display = "";
        errorRow.scrollIntoView({ behavior: "smooth", block: "center" });

        setTimeout(() => {
            errorTextarea.focus();
            errorRow.style.transition = "transform 0.2s";
            errorRow.style.transform = "translateX(8px)";
            setTimeout(() => (errorRow.style.transform = "translateX(0)"), 200);
        }, 300);
        return;
    }

    const originalBtnText = btnSave.innerHTML;
    btnSave.disabled = true;
    btnSave.innerHTML = "<span>⏳ Đang đóng gói...</span>";

    try {
        const response = await fetch("http://localhost:3333/api/save/file", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                folderPath: exportPath,
                fileName: originalFileName,
                originalBuffer: Array.from(originalBuffer),
                translations: parsedData,
            }),
        });

        const result = await response.json();
        if (result.success) {
            alert(`Xong! File ${originalFileName} đã nằm gọn trong thư mục.`);
        } else {
            alert("Lỗi từ máy chủ: " + result.message);
        }
    } catch (err) {
        alert("Không thể kết nối đến Backend.");
    } finally {
        btnSave.disabled = false;
        btnSave.innerHTML = originalBtnText;
    }
});
