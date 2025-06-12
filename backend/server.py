import http.server
import socketserver
import json
import cv2
import numpy as np
from ultralytics import YOLO
import mysql.connector
from urllib.parse import parse_qs
from datetime import datetime
import base64
from threading import Thread
import time

# Cấu hình database
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "",
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

# Khởi tạo OpenCV Haar Cascade
try:
    print("Đang khởi tạo Haar Cascade...")
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    if face_cascade.empty():
        raise Exception("Không tải được file haarcascade_frontalface_default.xml")
    print("Khởi tạo Haar Cascade thành công!")
except Exception as e:
    print(f"Lỗi khi khởi tạo Haar Cascade: {e}")
    exit()

# Biến toàn cục cho webcam
camera = None
running = False
capture_thread = None

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

# Hàm phát khung hình webcam trong thread
def generate_frames():
    global camera, running
    print("Bắt đầu stream video...")
    while running:
        if camera is None or not camera.isOpened():
            print("Camera không hoạt động, dừng stream.")
            break
        success, frame = camera.read()
        if not success:
            print("Không đọc được frame từ camera.")
            break
        # Phát hiện đối tượng bằng YOLO
        results = yolo_model(frame)
        for result in results:
            boxes = result.boxes.xyxy.cpu().numpy()
            for box in boxes:
                x1, y1, x2, y2 = map(int, box[:4])
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                # Phát hiện khuôn mặt chi tiết bằng Haar Cascade trong vùng YOLO
                roi_gray = cv2.cvtColor(frame[y1:y2, x1:x2], cv2.COLOR_BGR2GRAY)
                faces = face_cascade.detectMultiScale(roi_gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
                for (fx, fy, fw, fh) in faces:
                    cv2.rectangle(frame[y1:y2, x1:x2], (fx, fy), (fx + fw, fy + fh), (0, 0, 255), 2)
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

# Hàm đăng ký khuôn mặt
def register_face(studentId, fullName, image_data):
    print(f"Đang xử lý đăng ký khuôn mặt cho sinh viên {studentId}...")
    try:
        img_data = base64.b64decode(image_data.split(',')[1])
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except Exception as e:
        print(f"Lỗi giải mã ảnh: {str(e)}")
        return {"error": f"Cannot decode image: {str(e)}"}

    if img is None:
        print("Hình ảnh không hợp lệ sau khi giải mã.")
        return {"error": "Cannot decode image"}

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
        print(f"Lỗi YOLO: {str(e)}")
        return {"error": f"YOLO error: {str(e)}"}

    if not person_detected:
        print("Không phát hiện được người trong ảnh.")
        return {"error": "No person detected"}

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
        print("Không phát hiện được khuôn mặt bằng Haar Cascade.")
        return {"error": "No face detected by Haar Cascade"}

    # Lưu thông tin cơ bản vào database
    db = connect_db()
    if db is None:
        print("Không thể kết nối database.")
        return {"error": "Database connection failed"}

    cursor = db.cursor()
    try:
        print(f"Đang lưu sinh viên {studentId} vào database...")
        cursor.execute("INSERT INTO students (student_id, full_name) VALUES (%s, %s)",
                       (studentId, fullName))
        db.commit()
        print("Lưu sinh viên thành công.")
        return {"message": "Face registered successfully", "student_id": studentId}
    except mysql.connector.Error as e:
        db.rollback()
        print(f"Lỗi lưu vào database: {e.errno} - {e.msg}")
        return {"error": f"Error saving to database: {e.errno} - {e.msg}"}
    finally:
        cursor.close()
        db.close()

# Hàm ghi điểm danh
def record_attendance(studentId, subject, lecture, image_data, imageUrl):
    print(f"Đang xử lý điểm danh cho sinh viên {studentId}...")
    try:
        img_data = base64.b64decode(image_data.split(',')[1])
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except Exception as e:
        print(f"Lỗi giải mã ảnh: {str(e)}")
        return {"error": f"Cannot decode image: {str(e)}"}

    if img is None:
        print("Hình ảnh không hợp lệ sau khi giải mã.")
        return {"error": "Cannot decode image"}

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
        print(f"Lỗi YOLO: {str(e)}")
        return {"error": f"YOLO error: {str(e)}"}

    if not person_detected:
        print("Không phát hiện được người trong ảnh.")
        return {"error": "No person detected"}

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
        print("Không phát hiện được khuôn mặt bằng Haar Cascade.")
        return {"error": "No face detected by Haar Cascade"}

    # Lấy thông tin sinh viên từ database
    db = connect_db()
    if db is None:
        print("Không thể kết nối database.")
        return {"error": "Database connection failed"}

    cursor = db.cursor()
    try:
        cursor.execute("SELECT full_name FROM students WHERE student_id = %s", (studentId,))
        student = cursor.fetchone()
        if not student:
            print(f"Sinh viên {studentId} chưa được đăng ký.")
            return {"error": "Student not registered"}
        full_name = student[0]

        # Lưu điểm danh
        attendance_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        face_id = "recognized_face"
        cursor.execute(
            "INSERT INTO attendance (student_id, full_name, subject, lecture, attendance_time, face_id, image_url) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (studentId, full_name, subject, lecture, attendance_time, face_id, imageUrl)
        )
        db.commit()
        print("Ghi điểm danh thành công.")
        return {
            "message": "Attendance recorded successfully",
            "student_id": studentId,
            "full_name": full_name,
            "attendance_time": attendance_time,
            "face_id": face_id,
            "image_url": imageUrl
        }
    except mysql.connector.Error as e:
        db.rollback()
        print(f"Lỗi lưu điểm danh vào database: {e.errno} - {e.msg}")
        return {"error": f"Error saving to database: {e.errno} - {e.msg}"}
    finally:
        cursor.close()
        db.close()

# Hàm lấy điểm danh gần nhất
def get_latest_attendance():
    print("Đang lấy thông tin điểm danh gần nhất...")
    db = connect_db()
    if db is None:
        print("Không thể kết nối database.")
        return {"error": "Database connection failed"}

    cursor = db.cursor()
    try:
        cursor.execute("SELECT * FROM attendance ORDER BY attendance_time DESC LIMIT 1")
        attendance = cursor.fetchone()
        if not attendance:
            print("Không có bản ghi điểm danh nào.")
            return {}
        return {
            "id": attendance[0],
            "student_id": attendance[1],
            "full_name": attendance[2],
            "subject": attendance[3],
            "lecture": attendance[4],
            "attendance_time": str(attendance[5]),
            "face_id": attendance[6],
            "image_url": attendance[7]
        }
    except mysql.connector.Error as e:
        print(f"Lỗi truy vấn điểm danh: {e.errno} - {e.msg}")
        return {"error": f"Error fetching attendance: {e.errno} - {e.msg}"}
    finally:
        cursor.close()
        db.close()

# Hàm lấy danh sách môn học
def get_subjects():
    print("Đang lấy danh sách môn học...")
    db = connect_db()
    if db is None:
        print("Không thể kết nối database.")
        return {"error": "Database connection failed"}

    cursor = db.cursor()
    try:
        cursor.execute("SELECT DISTINCT subject FROM attendance")
        subjects = cursor.fetchall()
        result = [row[0] for row in subjects if row[0]]  # Lấy các subject duy nhất
        return result
    except mysql.connector.Error as e:
        print(f"Lỗi truy vấn môn học: {e.errno} - {e.msg}")
        return {"error": f"Error fetching subjects: {e.errno} - {e.msg}"}
    finally:
        cursor.close()
        db.close()

# Hàm thêm môn học
def add_subject(subject):
    print(f"Đang thêm môn học: {subject}")
    db = connect_db()
    if db is None:
        print("Không thể kết nối database.")
        return {"error": "Database connection failed"}

    cursor = db.cursor()
    try:
        cursor.execute("INSERT INTO subjects (subject_name) VALUES (%s)", (subject,))
        db.commit()
        return {"message": "Subject added successfully"}
    except mysql.connector.Error as e:
        db.rollback()
        print(f"Lỗi thêm môn học: {e.errno} - {e.msg}")
        return {"error": f"Error adding subject: {e.errno} - {e.msg}"}
    finally:
        cursor.close()
        db.close()

# Hàm lấy danh sách lịch giảng dạy
def get_lectures():
    print("Đang lấy danh sách lịch giảng dạy...")
    db = connect_db()
    if db is None:
        print("Không thể kết nối database.")
        return {"error": "Database connection failed"}

    cursor = db.cursor()
    try:
        cursor.execute("SELECT subject, time, session, teacher FROM lectures")
        lectures = cursor.fetchall()
        result = [
            {"subject": row[0], "time": row[1], "session": row[2], "teacher": row[3]} for row in lectures
        ]
        return result
    except mysql.connector.Error as e:
        print(f"Lỗi truy vấn lịch giảng dạy: {e.errno} - {e.msg}")
        return {"error": f"Error fetching lectures: {e.errno} - {e.msg}"}
    finally:
        cursor.close()
        db.close()

# Hàm thêm lịch giảng dạy
def add_lecture(subject, time, session, teacher):
    print(f"Đang thêm lịch giảng dạy: {subject} - {session}")
    db = connect_db()
    if db is None:
        print("Không thể kết nối database.")
        return {"error": "Database connection failed"}

    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO lectures (subject, time, session, teacher) VALUES (%s, %s, %s, %s)",
            (subject, time, session, teacher)
        )
        db.commit()
        return {"message": "Lecture added successfully"}
    except mysql.connector.Error as e:
        db.rollback()
        print(f"Lỗi thêm lịch giảng dạy: {e.errno} - {e.msg}")
        return {"error": f"Error adding lecture: {e.errno} - {e.msg}"}
    finally:
        cursor.close()
        db.close()

# Server xử lý yêu cầu từ frontend
PORT = 5000

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        global camera, running
        print(f"Nhận GET request tại: {self.path}")
        if self.path == '/video_feed':
            if not running or camera is None or not camera.isOpened():
                self.send_response(500)
                self.send_header('Content-type', 'text/plain')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(b"Camera not started")
                print("Camera chưa được khởi động.")
                return
            self.send_response(200)
            self.send_header('Content-type', 'multipart/x-mixed-replace; boundary=frame')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            try:
                for frame in generate_frames():
                    self.wfile.write(frame)
            except Exception as e:
                print(f"Error streaming video: {e}")
        elif self.path == '/attendance':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            result = get_latest_attendance()
            self.wfile.write(json.dumps(result).encode())
        elif self.path == '/subjects':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            result = get_subjects()
            self.wfile.write(json.dumps(result).encode())
        elif self.path == '/lectures':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            result = get_lectures()
            self.wfile.write(json.dumps(result).encode())
        else:
            super().do_GET()

    def do_POST(self):
        global camera, running, capture_thread
        print(f"Nhận POST request tại: {self.path}")
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length).decode('utf-8')
        params = json.loads(post_data) if 'application/json' in self.headers.get('Content-type', '') else parse_qs(post_data)

        if self.path == '/start_capture':
            if not running:
                camera = cv2.VideoCapture(0)
                if not camera.isOpened():
                    result = {"status": "error", "message": "Cannot open camera"}
                    self.send_response(500)
                    print("Không thể mở camera.")
                else:
                    running = True
                    capture_thread = Thread(target=lambda: None, daemon=True)  # Placeholder thread
                    result = {"status": "started"}
                    self.send_response(200)
                    print("Camera đã khởi động.")
            else:
                result = {"status": "already started"}
                self.send_response(200)
                print("Camera đã được khởi động từ trước.")
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())

        elif self.path == '/stop_capture':
            if running and camera is not None:
                running = False
                camera.release()
                camera = None
                result = {"status": "stopped"}
                self.send_response(200)
                print("Camera đã dừng.")
            else:
                result = {"status": "already stopped"}
                self.send_response(200)
                print("Camera đã dừng từ trước.")
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())

        elif self.path == '/register_face':
            studentId = params.get('studentId', [''])[0]
            fullName = params.get('fullName', [''])[0]
            image_data = params.get('image', [''])[0]
            result = register_face(studentId, fullName, image_data)
            self.send_response(200 if "message" in result else 400)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())

        elif self.path == '/attendance':
            studentId = params.get('studentId', [''])[0]
            subject = params.get('subject', ['N/A'])[0]
            lecture = params.get('lecture', ['N/A'])[0]
            image_data = params.get('image', [''])[0]
            imageUrl = params.get('imageUrl', ['https://via.placeholder.com/150'])[0]
            result = record_attendance(studentId, subject, lecture, image_data, imageUrl)
            self.send_response(200 if "message" in result else 400)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())

        elif self.path == '/subjects':
            subject = params.get('subject', [''])[0]
            result = add_subject(subject)
            self.send_response(200 if "message" in result else 400)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())

        elif self.path == '/lectures':
            subject = params.get('subject', [''])[0]
            time = params.get('time', [''])[0]
            session = params.get('session', [''])[0]
            teacher = params.get('teacher', [''])[0]
            result = add_lecture(subject, time, session, teacher)
            self.send_response(200 if "message" in result else 400)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())

if __name__ == "__main__":
    try:
        with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
            print("Server running at port", PORT)
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("Server stopped by user")
        if camera is not None:
            camera.release()