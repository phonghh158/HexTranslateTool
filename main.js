let originalBuffer = null;
let originalFileName = "";
let parsedData = [];
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Đổi Theme
const themeToggleBtn = document.getElementById("themeToggle");
let isDarkMode = false;

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

// Đọc File
document.getElementById("fileInput").addEventListener("change", async function (e) {
    const file = e.target.files[0];
    if (!file) return;
    originalFileName = file.name;

    const arrayBuffer = await file.arrayBuffer();
    originalBuffer = new Uint8Array(arrayBuffer);

    parseBinary(originalBuffer);
    renderTable();
    document.getElementById("btnSave").disabled = false;
});

function parseBinary(buffer) {
    parsedData = [];
    let currentBytes = [];
    let startOffset = -1;

    for (let i = 0; i < buffer.length; i++) {
        const byte = buffer[i];
        // Đã mở rộng để đọc toàn bộ ký tự Unicode (hỗ trợ tiếng Thái/Đức)
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

// Giao diện
function renderTable() {
    const tbody = document.getElementById("tbody");
    tbody.innerHTML = "";

    if (parsedData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state">Không tìm thấy dữ liệu văn bản.</td></tr>`;
        return;
    }

    parsedData.forEach((item, index) => {
        const tr = document.createElement("tr");
        tr.id = `row_${index}`;

        tr.innerHTML = `
            <td class="text-gray">0x${item.offset.toString(16).toUpperCase()}</td>
            <td><textarea class="readonly-box" readonly>${item.original}</textarea></td>
            <td>
                <div class="td-actions">
                    <button class="btn-row-translate btn-gemini" onclick="translateSingleRow(${index}, 'gemini')" id="btn_gemini_${index}" title="Dịch bằng AI">✦</button>
                    <button class="btn-row-translate btn-google" onclick="translateSingleRow(${index}, 'google')" id="btn_google_${index}" title="Dịch bằng Google">G</button>
                </div>
            </td>
            <td>
                <textarea id="textarea_${index}" oninput="updateText(${index}, this.value)">${item.translated}</textarea>
            </td>
            <td id="status_${index}"></td>
        `;
        tbody.appendChild(tr);
        updateText(index, item.translated);
    });
}

function updateText(index, value) {
    parsedData[index].translated = value;
    const currentBytes = value === "" ? 0 : encoder.encode(value).length;
    const maxBytes = parsedData[index].maxLength;

    const statusTd = document.getElementById(`status_${index}`);
    const row = document.getElementById(`row_${index}`);

    if (value === "") {
        statusTd.innerHTML = `<span class="text-gray">Chưa dịch<br>Tối đa: ${maxBytes} byte</span>`;
        row.classList.remove("row-error");
    } else if (currentBytes > maxBytes) {
        statusTd.innerHTML = `<span class="text-red">Vượt quá giới hạn<br>${currentBytes}/${maxBytes} byte</span><br><span class="status-badge" style="background-color: var(--error-bg); color: var(--error-text);">Thừa ${currentBytes - maxBytes} byte</span>`;
        row.classList.add("row-error");
    } else {
        statusTd.innerHTML = `<span class="text-green">Hợp lệ<br>${currentBytes}/${maxBytes} byte</span><br><span class="status-badge" style="background-color: var(--secondary-bg); color: var(--text-muted);">Còn trống ${maxBytes - currentBytes} byte</span>`;
        row.classList.remove("row-error");
    }
}

// Logic dịch từng dòng
async function translateSingleRow(index, engine) {
    const originalText = parsedData[index].original;
    const btnGemini = document.getElementById(`btn_gemini_${index}`);
    const btnGoogle = document.getElementById(`btn_google_${index}`);
    const textarea = document.getElementById(`textarea_${index}`);

    // Bỏ qua mã hệ thống (Ví dụ: EventText_10000001)
    if (/^[a-zA-Z0-9_]+$/.test(originalText.trim())) {
        textarea.value = originalText;
        updateText(index, originalText);
        return;
    }

    // LẤY THÔNG TIN NGÔN NGỮ TỪ GIAO DIỆN
    const sourceSelect = document.getElementById("sourceLang");
    const targetSelect = document.getElementById("targetLang");

    const sourceLangCode = sourceSelect.value;
    const sourceLangName =
        sourceSelect.options[sourceSelect.selectedIndex].getAttribute("data-name");

    const targetLangCode = targetSelect.value;
    const targetLangName =
        targetSelect.options[targetSelect.selectedIndex].getAttribute("data-name");

    // Khóa 2 nút lại
    btnGemini.disabled = true;
    btnGoogle.disabled = true;

    // Đổi text để báo hiệu đang dịch
    const originalBtnText = engine === "gemini" ? btnGemini.innerHTML : btnGoogle.innerHTML;
    if (engine === "gemini") btnGemini.innerHTML = "⏳...";
    if (engine === "google") btnGoogle.innerHTML = "⏳...";

    const apiPath = engine === "gemini" ? "/api/translate/gemini" : "/api/translate/google";

    try {
        const response = await fetch(`http://localhost:3000${apiPath}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: originalText,
                sourceLangCode: sourceLangCode,
                sourceLangName: sourceLangName,
                targetLangCode: targetLangCode,
                targetLangName: targetLangName,
            }),
        });

        const data = await response.json();

        if (data.success) {
            parsedData[index].translated = data.translatedText;
            textarea.value = data.translatedText;
            updateText(index, data.translatedText);
        } else {
            alert(`Lỗi từ máy chủ: ${data.message}`);
        }
    } catch (error) {
        console.error(error);
        alert("Không thể kết nối đến máy chủ. Hãy mở server lên.");
    } finally {
        // Mở khóa và trả lại text cũ
        btnGemini.disabled = false;
        btnGoogle.disabled = false;
        if (engine === "gemini") btnGemini.innerHTML = "✦";
        if (engine === "google") btnGoogle.innerHTML = "G";
    }
}

// Tìm kiếm
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

// Đóng gói và gửi file xuống Backend
document.getElementById("btnSave").addEventListener("click", async function () {
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

    let outputBuffer = new Uint8Array(originalBuffer);

    parsedData.forEach((item) => {
        if (item.translated && item.translated.trim() !== "") {
            const translatedBytes = encoder.encode(item.translated);
            for (let i = 0; i < translatedBytes.length; i++) {
                outputBuffer[item.offset + i] = translatedBytes[i];
            }
            // Đệm khoảng trắng (0x20) cho các byte còn thừa
            for (let i = translatedBytes.length; i < item.maxLength; i++) {
                outputBuffer[item.offset + i] = 0x20;
            }
        }
    });

    const btnSave = document.getElementById("btnSave");
    const originalBtnText = btnSave.innerHTML;
    btnSave.disabled = true;
    btnSave.innerHTML = "⏳ Đang lưu...";

    try {
        const response = await fetch("http://localhost:3000/api/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                folderPath: exportPath,
                fileName: originalFileName,
                bufferData: Array.from(outputBuffer),
            }),
        });

        const result = await response.json();
        if (result.success) {
            alert(`Xong! File ${originalFileName} đã nằm gọn trong thư mục.`);
        } else {
            alert("Lỗi từ máy chủ: " + result.message);
        }
    } catch (err) {
        alert("Không thể kết nối!.");
    } finally {
        btnSave.disabled = false;
        btnSave.innerHTML = originalBtnText;
    }
});
