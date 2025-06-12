import mysql.connector
import cv2
import numpy as np
from ultralytics import YOLO
from datetime import datetime
import os

# Cấu hình kết nối database
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "",  # Cập nhật mật khẩu nếu cần
    "database": "attendance_db",
    "port": 3306
}

# Khởi tạo YOLO
try:
    print("Đang khởi tạo YOLO...")
    yolo_model = YOLO('yolov8n.pt')
    print("Khởi tạo YOLO thành công!")
except Exception as e:
    print(f"Lỗi khi khởi tạo YOLO: {e}")
    exit()

# Khởi tạo OpenCV Haar Cascade để phát hiện khuôn mặt
try:
    print("Đang khởi tạo Haar Cascade...")
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    if face_cascade.empty():
        raise Exception("Không tải được file haarcascade_frontalface_default.xml")
    print("Khởi tạo Haar Cascade thành công!")
except Exception as e:
    print(f"Lỗi khi khởi tạo Haar Cascade: {e}")
    exit()

# Hàm kết nối database
def connect_db():
    try:
        print("Đang kết nối đến database...")
        db = mysql.connector.connect(**db_config)
        if db.is_connected():
            print("Kết nối database thành công!")
        return db
    except mysql.connector.Error as e:
        print(f"Lỗi kết nối database: {e.errno} - {e.msg}")
        return None

# Hàm đăng ký khuôn mặt (phát hiện khuôn mặt và lưu thông tin cơ bản)
def register_face(student_id, full_name, image_path):
    if not os.path.exists(image_path):
        print(f"File ảnh không tồn tại: {image_path}")
        return False

    print(f"Đang đọc ảnh từ: {image_path}")
    img = cv2.imread(image_path)
    if img is None:
        print(f"Không thể đọc ảnh tại: {image_path}")
        return False

    # Phát hiện đối tượng "person" bằng YOLO
    person_detected = False
    try:
        print("Đang phát hiện đối tượng bằng YOLO...")
        results = yolo_model(img)
        for result in results:
            boxes = result.boxes.xyxy.cpu().numpy()
            classes = result.boxes.cls.cpu().numpy()
            for box, cls in zip(boxes, classes):
                if int(cls) == 0:  # Lớp "person"
                    x1, y1, x2, y2 = map(int, box[:4])
                    person_detected = True
                    print(f"Phát hiện đối tượng 'person' tại: ({x1}, {y1}) - ({x2}, {y2})")
                    break
            if person_detected:
                break
    except Exception as e:
        print(f"Lỗi YOLO: {e}")
        return False

    if not person_detected:
        print("Không phát hiện đối tượng 'person'!")
        return False

    # Phát hiện khuôn mặt bằng OpenCV Haar Cascade
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    face_detected = False
    for (x, y, w, h) in faces:
        cv2.rectangle(img, (x, y), (x+w, y+h), (0, 255, 0), 2)
        face_detected = True
        print(f"Phát hiện khuôn mặt tại: ({x}, {y}) - ({x+w}, {y+h})")
        break

    if not face_detected:
        print("Không phát hiện khuôn mặt bằng Haar Cascade!")
        return False

    # Lưu thông tin cơ bản vào database
    db = connect_db()
    if db is None:
        print("Không thể kết nối database, không lưu được dữ liệu!")
        return False

    cursor = db.cursor()
    try:
        print(f"Đang lưu sinh viên {student_id} vào database...")
        cursor.execute("INSERT INTO students (student_id, full_name) VALUES (%s, %s)",
                       (student_id, full_name))
        db.commit()
        print(f"Đã đăng ký sinh viên {student_id} thành công!")
        return True
    except mysql.connector.Error as e:
        print(f"Lỗi khi lưu vào database: {e.errno} - {e.msg}")
        db.rollback()
        return False
    finally:
        cursor.close()
        db.close()

# Hàm ghi điểm danh
def record_attendance(student_id, full_name, subject, lecture, face_id, image_url):
    db = connect_db()
    if db is None:
        print("Không thể kết nối database, không lưu được dữ liệu!")
        return False

    cursor = db.cursor()
    try:
        print(f"Đang ghi điểm danh cho sinh viên {student_id}...")
        attendance_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        cursor.execute("INSERT INTO attendance (student_id, full_name, subject, lecture, attendance_time, face_id, image_url) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                       (student_id, full_name, subject, lecture, attendance_time, face_id, image_url))
        db.commit()
        print("Đã ghi điểm danh thành công!")
        return True
    except mysql.connector.Error as e:
        print(f"Lỗi khi ghi điểm danh: {e.errno} - {e.msg}")
        db.rollback()
        return False
    finally:
        cursor.close()
        db.close()

# Test script
if __name__ == "__main__":
    print("Bắt đầu chạy script...")
    image_path = "images/22BI13029.jpg"
    if register_face("22BI13029", "Nguyen Thi Ha Anh", image_path):
        record_attendance("22BI13029", "Nguyen Thi Ha Anh", "Math", "Lecture 1", "face_22BI13029", "http://example.com/image.jpg")
    else:
        print("Đăng ký khuôn mặt thất bại, không ghi điểm danh.")
    print("Kết thúc script.")