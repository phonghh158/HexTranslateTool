const axios = require("axios");

// Định nghĩa cấu hình URL của Server local
const SERVER_URL = "http://localhost:3333/api/translate/google";

// Hàm chạy test route dịch Google
async function runTest() {
    console.log("🚀 Bắt đầu test API dịch tự động bằng Google...");

    // Dữ liệu giả lập từ Frontend gửi lên
    const testData = {
        str: "Hello, how are you today? I am testing the new translation tool.",
        sourceLangCode: "en",
        targetLangCode: "vi",
    };

    try {
        // Gửi request POST lên server
        const response = await axios.post(SERVER_URL, testData);

        // In kết quả nhận được từ Server
        console.log("\n✅ KẾT QUẢ TEST THÀNH CÔNG:");
        console.log("--------------------------------------------------");
        console.log("Trạng thái:", response.status);
        console.log("Dữ liệu trả về:", JSON.stringify(response.data, null, 2));
        console.log("--------------------------------------------------");
    } catch (error) {
        console.error("\n❌ KẾT QUẢ TEST THẤT BẠI:");
        console.log("--------------------------------------------------");
        if (error.response) {
            // Lỗi trả về từ phía Server (Server vẫn chạy nhưng báo lỗi)
            console.error(`Mã lỗi từ Server (${error.response.status}):`, error.response.data);
        } else if (error.request) {
            // Lỗi không kết nối được tới Server
            console.error("Không thể kết nối tới Server.");
        } else {
            console.error("Lỗi cấu hình request:", error.message);
        }
        console.log("--------------------------------------------------");
    }
}

// Chạy hàm test
runTest();
