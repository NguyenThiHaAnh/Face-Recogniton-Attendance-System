# test_db.py
from sqlalchemy import create_engine

DATABASE_URL = "mysql+pymysql://root:@localhost/attendance_db"

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("✅ Kết nối MariaDB qua XAMPP thành công!")
except Exception as e:
    print("❌ Lỗi kết nối:", e)
