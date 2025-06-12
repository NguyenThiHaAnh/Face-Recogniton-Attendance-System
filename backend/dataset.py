import cv2
import os

# Nhập ID người dùng (ví dụ: 1)
face_id = input('\n Nhập ID người dùng (ví dụ: 1) =>  ')

# Tạo thư mục lưu ảnh nếu chưa có
if not os.path.exists('dataset'):
    os.makedirs('dataset')

# Load bộ phát hiện khuôn mặt
face_detector = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')

# Mở webcam
cam = cv2.VideoCapture(0)
cam.set(3, 640)  # chiều rộng
cam.set(4, 480)  # chiều cao

print("\n [INFO] Đang khởi động camera. Nhìn vào camera và đợi...")

count = 0

while True:
    ret, img = cam.read()
    if not ret:
        break

   # Không chuyển ảnh sang xám, giữ nguyên màu
    cv2.imshow('image', img)
    faces = face_detector.detectMultiScale(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), 1.3, 5)

    for (x, y, w, h) in faces:
        # Vẽ khung quanh mặt
        cv2.rectangle(img, (x, y), (x+w, y+h), (255, 0, 0), 2)

        # Lưu ảnh khuôn mặt vào thư mục dataset
        count += 1
        cv2.imwrite(f"dataset/User.{face_id}.{count}.jpg", img[y:y+h, x:x+w])  # Lưu ảnh màu

        cv2.imshow('image', img)

    # Nhấn ESC để thoát hoặc chụp đủ 30 ảnh
    k = cv2.waitKey(100) & 0xff
    if k == 27 or count >= 30:  # Nhấn ESC hoặc chụp đủ 30 ảnh
        break
    elif count >= 30:
        break

print("\n [INFO] Đã lưu thành công {0} ảnh khuôn mặt vào folder /dataset".format(count))

# Dọn dẹp
cam.release()
cv2.destroyAllWindows()
