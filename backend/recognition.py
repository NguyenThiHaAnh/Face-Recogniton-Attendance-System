import cv2
import numpy as np

recognizer = cv2.face.LBPHFaceRecognizer_create()
recognizer.read('trainer/trainer.yml')
cascadePath = 'haarcascade_frontalface_default.xml'
faceCascade = cv2.CascadeClassifier(cascadePath)

names = ['None', 'Ha Anh', 'Son Tung', 'Quoc Khanh', 'Tien Dat', 'Gia Bach', 'Hai Dang', 'Duc Long', 'Du Thi Cam Tu']  # Thêm tên tương ứng ID nếu muốn

cam = cv2.VideoCapture(0)
cam.set(3, 640)
cam.set(4, 480)
font = cv2.FONT_HERSHEY_SIMPLEX

print("\n [INFO] Nhận diện khuôn mặt. Nhấn ESC để thoát.")

while True:
    ret, img = cam.read()
    if not ret:
        break

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = faceCascade.detectMultiScale(gray, 1.2, 5, minSize=(30, 30))

    for (x, y, w, h) in faces:
        cv2.rectangle(img, (x, y), (x+w, y+h), (0, 255, 0), 2)
        id, confidence = recognizer.predict(gray[y:y+h, x:x+w])

        if confidence < 100:
            name = names[id] if id < len(names) else f"User{id}"
            confidence_text = f"  {round(100 - confidence)}%"
        else:
            name = "unknown"
            confidence_text = f"  {round(100 - confidence)}%"

        cv2.putText(img, str(name), (x+5, y-5), font, 1, (255,255,255), 2)
        cv2.putText(img, str(confidence_text), (x+5, y+h-5), font, 1, (255,255,0), 1)

    cv2.imshow('camera', img)
    k = cv2.waitKey(10) & 0xff
    if k == 27:
        break

print("\n [INFO] Thoát chương trình.")
cam.release()
cv2.destroyAllWindows()
