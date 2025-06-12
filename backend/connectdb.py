import mysql.connector

# Cấu hình database
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "",  # Cập nhật mật khẩu MySQL nếu có
    "database": "attendance_db",
    "port": 3306
}

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

# Kiểm tra kết nối
if __name__ == "__main__":
    db = connect_db()
    if db:
        db.close()