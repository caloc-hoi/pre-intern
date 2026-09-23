# PRE:INTERN — Prototype v3

**YOUR FIRST JOB, BEFORE YOUR FIRST JOB!**

Đây là prototype game mô phỏng nghề nghiệp. Người chơi chọn nghề, thực hiện nhiệm vụ tương tác và nhận Bản đồ năng lực.

## Ngôn ngữ giao diện

Chỉ **tên game** và **tagline** trên landing page dùng tiếng Anh. Các nội dung trải nghiệm còn lại dùng tiếng Việt.

## Tương tác

Game không dùng multiple-choice. Các dạng nhiệm vụ gồm kéo-thả sắp xếp, phân loại, xếp ưu tiên, nhập câu trả lời, mô phỏng phỏng vấn, phản hồi qua chat, phân bổ nguồn lực và chọn khung hình.

## AI phân tích câu trả lời ngắn

Với các nhiệm vụ có câu trả lời tự do, sau khi người chơi bấm nộp:

1. Game hiển thị trạng thái `AI ĐANG PHÂN TÍCH…`.
2. Frontend gửi `role`, `task`, `prompt`, `skill`, `rubric` và `answer` tới `POST /api/analyze`.
3. Server gọi OpenAI Responses API và yêu cầu Structured Output dạng JSON.
4. Kết quả hiển thị ngay trong nhiệm vụ: điểm AI, điểm mạnh, điểm nên cải thiện và bước luyện tập tiếp theo.
5. Điểm AI được kết hợp với điểm gameplay của task để cập nhật dữ liệu Skill Map.

Prototype vẫn có **phân tích mô phỏng local** làm phương án dự phòng khi server AI chưa được cấu hình.

OpenAI khuyến nghị Responses API cho luồng sinh văn bản hiện tại; Structured Outputs có thể dùng schema để nhận JSON có cấu trúc. Xem tài liệu chính thức khi triển khai production.

## Chạy bản có AI thật

```bash
npm install
```

Tạo file `.env` từ `.env.example` và thêm API key. Sau đó chạy:

```bash
node --env-file=.env server.js
```

Mở `http://localhost:3000`.

**Không đặt API key trực tiếp trong `index.html`.** API key phải ở phía server.

## Chạy bản không cần server

Mở `index.html` trực tiếp trong trình duyệt. Game vẫn chạy, nhưng các câu trả lời tự do sẽ dùng bộ phân tích mô phỏng local thay vì AI thật.
