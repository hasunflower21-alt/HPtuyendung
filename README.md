# 🚀 Hướng Dẫn Đẩy Code Lên GitHub & Triển Khai Cloudflare Pages

Hệ thống **FB Đẩy Bài - Tự Động Hóa Đăng Nhóm Chuẩn Anti-Spam** đã được cấu hình sẵn sàng 100% để triển khai lên **Cloudflare Pages** (chạy nhanh toàn cầu, miễn phí, hỗ trợ serverless Functions cho AI).

---

## 📌 PHẦN 1: Đẩy Mã Nguồn Lên GitHub

Nếu bạn đã có tài khoản GitHub:

1. **Tạo Repository mới trên GitHub**:
   - Truy cập [https://github.com/new](https://github.com/new)
   - Đặt tên Repository (Ví dụ: `fb-auto-post-tool`)
   - Chọn chế độ **Private** (khuyến nghị) hoặc **Public**
   - Không cần tích chọn "Add a README file" hay ".gitignore" (vì dự án đã có sẵn)
   - Nhấn **Create repository**.

2. **Chạy các lệnh Git tại máy tính (Terminal / CMD)**:

```bash
# 1. Khởi tạo kho git (nếu chưa có)
git init

# 2. Thêm tất cả tệp vào git
git add .

# 3. Tạo commit đầu tiên
git commit -m "feat: release fb auto post bump tool ready for cloudflare pages"

# 4. Đổi nhánh chính sang main
git branch -M main

# 5. Liên kết tới kho GitHub vừa tạo (thay URL bằng link repo của bạn)
git remote add origin https://github.com/<USERNAME>/<TEN_REPO>.git

# 6. Đẩy code lên GitHub
git push -u origin main
```

---

## ☁️ PHẦN 2: Triển Khai Lên Cloudflare Pages (Miễn Phí 100%)

Cloudflare Pages sẽ tự động nhận diện repository từ GitHub và tự động build lại mỗi khi bạn push code mới.

### Bước 1: Kết nối GitHub với Cloudflare Pages
1. Đăng nhập [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Ở thanh menu bên trái, chọn **Workers & Pages** > **Overview**
3. Nhấn **Create application** > Chọn tab **Pages** > Chọn **Connect to Git**
4. Chọn tài khoản GitHub của bạn và chọn repository vừa đẩy lên (ví dụ: `fb-auto-post-tool`) > Bấm **Begin setup**.

### Bước 2: Cấu hình Build Settings
Điền các thông số chuẩn sau:
- **Project name**: `fb-auto-post-tool` (hoặc tùy chọn)
- **Production branch**: `main`
- **Framework preset**: Chọn `Vite` (hoặc `None`)
- **Build command**:
  ```bash
  npm run build:pages
  ```
- **Build output directory**:
  ```bash
  dist
  ```
- **Root directory**: Để trống (hoặc `/`)

### Bước 3: Cài đặt Biến Môi Trường (Environment Variables)
*Mục này để kích hoạt tính năng AI tạo Spintax tự động trên Cloudflare Edge:*
- Trong phần **Environment variables (advanced)**, bấm **Add variable**:
  - **Variable name**: `GEMINI_API_KEY`
  - **Value**: Dán API Key Gemini của bạn vào đây (tạo miễn phí tại Google AI Studio).
- Bấm **Save and Deploy**.

Cloudflare Pages sẽ tiến hành build trong vòng ~30 - 60 giây và cấp cho bạn một tên miền miễn phí cực nhanh dạng:
👉 `https://fb-auto-post-tool.pages.dev`

---

## ⚡ CÁCH 2: Triển Khai Nhanh Qua Wrangler CLI (Không cần GitHub)

Nếu bạn muốn deploy trực tiếp từ máy tính lên Cloudflare ngay lập tức:

```bash
# 1. Cài đặt dependencies và build dự án
npm install
npm run build:pages

# 2. Đăng nhập và deploy lên Cloudflare Pages
npx wrangler pages deploy dist --project-name=fb-auto-post-tool
```

---

## 🛡️ Các Tệp Cấu Hình Đã Chuẩn Bị Sẵn Cho Cloudflare:
- `public/_redirects`: Định tuyến SPA chuẩn (`/* /index.html 200`) chống lỗi 404 khi tải lại trang.
- `public/_headers`: Cấu hình bộ nhớ đệm (caching) và bảo mật trình duyệt.
- `functions/api/`: Bộ API Serverless Edge Functions chạy trực tiếp trên mạng lưới Cloudflare Worker xử lý tính năng AI Spintax.
- `.node-version`: Chỉ định phiên bản Node.js 20 LTS chuẩn tương thích.
- `wrangler.toml`: Cấu hình triển khai tự động qua Cloudflare CLI.
