# 🌸 Doraemon Studio - Trình Biên Dịch Binary, Hex Translator

### 👨‍💻 Tác giả: Hoàng Hồng Phong

Doraemon Studio là một công cụ hỗ trợ dịch thuật trực tiếp các tệp dữ liệu nhị phân (`.dat`, `.bytes`, `.bin`). Phần mềm cung cấp giao diện trực quan, tự động tính toán giới hạn dung lượng byte, hỗ trợ dịch máy qua Google Translate API và đóng gói tệp tin mà không làm hỏng cấu trúc gốc của dữ liệu.

## 🛠 Yêu cầu hệ thống (Prerequisites)

Để khởi chạy được phần mềm này, máy tính của bạn bắt buộc phải cài đặt **Node.js**.

- **Tải Node.js tại đây:** [https://nodejs.org](https://nodejs.org/) (Khuyến nghị tải phiên bản **LTS - Recommended for Most Users**).
- Trình duyệt web hiện đại (Chrome, Edge, Firefox,...).

## 🚀 Hướng dẫn cài đặt và sử dụng

1. **Tải mã nguồn:** Tải toàn bộ thư mục dự án này về máy tính của bạn và giải nén (nếu tải dưới dạng `.zip`).
2. **Khởi chạy phần mềm:** - Tìm đến thư mục gốc của dự án.
    - Click đúp chuột vào file **`RUN_TOOL.bat`**.
3. **Cài đặt tự động (Dành cho lần chạy đầu tiên):** - Trong lần đầu khởi chạy, hệ thống sẽ tự động tải các thư viện cần thiết (có thể mất khoảng 1-2 phút tùy tốc độ mạng).
    - Vui lòng không tắt cửa sổ CMD màu đen trong quá trình này.
4. **Bắt đầu dịch thuật:** - Sau khi khởi động xong, trình duyệt web sẽ tự động mở trang `http://localhost:3333`.
    - Nhấn **Mở File Gốc (.dat)** để nạp dữ liệu và bắt đầu công việc.

## 📂 Cấu trúc dự án

```text
/DoraemonStudio
├── /backend            # Chứa mã nguồn Server (Node.js, Express)
│   ├── /src            # Các cấu hình trung gian (CORS, Middlewares)
│   ├── /routes         # API điều hướng (Google Translate, Save File)
│   ├── .env            # Cấu hình biến môi trường (PORT)
│   └── server.js       # File khởi động chính
├── /frontend           # Giao diện người dùng (HTML, CSS, JS thuần)
│   ├── /css
│   ├── /js
│   └── index.html
├── Start_Doraemon.bat  # File khởi chạy nhanh (1-click)
└── README.md           # Tài liệu hướng dẫn
```

## ⚙️ Tính năng nổi bật

- Giao diện thân thiện: Hỗ trợ Dark Mode/Light Mode, thanh tiến độ dịch thuật theo thời gian thực.
- Kiểm soát dung lượng Byte: Tự động đếm và cảnh báo khi chuỗi dịch vượt quá số lượng byte cho phép của bộ nhớ nhị phân gốc.
- Dịch máy tự động: Tích hợp gọi API Google Translate để dịch nhanh từng dòng thoại.
- Lưu bản nháp: Hỗ trợ xuất và nhập tiến độ làm việc dưới dạng file .json.

### Lưu ý: Không tắt cửa sổ Terminal/CMD trong suốt quá trình sử dụng phần mềm. Khi muốn đóng phần mềm, chỉ cần đóng cửa sổ Terminal.
