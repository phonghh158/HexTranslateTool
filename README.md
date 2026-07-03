# Doraemon Story of Seasons - Translation Hex Tool (Backend)

Đây là máy chủ xử lý dữ liệu (Backend) cho công cụ dịch thuật và đóng gói file binary của game Doraemon Story of Seasons.

## 🛠 Cấu trúc công nghệ

- **Môi trường:** Node.js
- **Framework:** Express.js
- **Dịch vụ:** Google Translate API, Gemini AI (tùy chọn)
- **Kiến trúc:** MVC (Routes, Controllers, Services)

## ⚙️ Yêu cầu hệ thống

- Node.js (phiên bản 14 trở lên)
- npm

## 🚀 Hướng dẫn cài đặt và khởi chạy

**Bước 1: Cài đặt thư viện**
Mở Terminal tại thư mục backend và chạy lệnh:
\`\`\`bash
npm install
\`\`\`

**Bước 2: Cấu hình biến môi trường**

1. Tạo một file tên là `.env` ở thư mục gốc của backend.
2. Thiết lập các thông số sau (có thể tham khảo file `.env.example` nếu có):
   \`\`\`env
   PORT=3333
   CLIENT_URL=http://localhost:5555

# GEMINI_API_KEY=your_api_key_here

\`\`\`

**Bước 3: Khởi chạy máy chủ**
Chạy lệnh sau để bật server với chế độ tự động cập nhật khi sửa code:
\`\`\`bash
npm run dev

# hoặc: nodemon server.js

\`\`\`
Máy chủ sẽ chạy tại địa chỉ: `http://localhost:3333`

## 🔗 Danh sách API cơ bản

- `GET /health` - Kiểm tra trạng thái máy chủ.
- `POST /api/translate/google` - Dịch văn bản tự động qua Google Translate.
- `POST /api/save` - Đóng gói và lưu dữ liệu hex xuống file.

## ⚠️ Lưu ý

- Client (Frontend) được cấu hình chạy ở cổng `5555`.
- File `.env` chứa các khóa bảo mật nên đã được đưa vào `.gitignore`, tuyệt đối không commit file này lên public repository.
