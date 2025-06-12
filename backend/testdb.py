import mysql.connector
from mysql.connector import Error
import time

db_config = {
    "host": "127.0.0.1",
    "user": "root",
    "password": "", 
    "database": "attendance_db",
    "port": 3307,
    "connection_timeout": 10,
    "charset": "utf8mb4"
}

def test_database_connection():
    connection = None
    start_time = time.time()
    try:
        print("Đang cố gắng kết nối đến database...")
        connection = mysql.connector.connect(**db_config)
        if connection.is_connected():
            print("Kết nối database thành công!")
            cursor = connection.cursor()
            cursor.execute("SELECT DATABASE();")
            db_name = cursor.fetchone()
            print(f"Bạn đã kết nối đến database: {db_name[0] if db_name else 'None'}")
            cursor.execute("SELECT VERSION();")
            version = cursor.fetchone()
            print(f"Phiên bản MariaDB: {version[0]}")
    except Error as e:
        elapsed_time = time.time() - start_time
        print(f"Lỗi kết nối database sau {elapsed_time:.2f} giây: {e.errno} - {e.msg}")
    except Exception as e:
        elapsed_time = time.time() - start_time
        print(f"Lỗi không xác định sau {elapsed_time:.2f} giây: {str(e)}")
    finally:
        if connection and connection.is_connected():
            connection.close()
            print("Đã đóng kết nối database.")
        elif not connection:
            print("Không thể thiết lập kết nối.")

if __name__ == "__main__":
    test_database_connection()