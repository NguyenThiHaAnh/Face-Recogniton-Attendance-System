# app/database/models.py
from flask_mysqldb import MySQL

mysql = MySQL()

def insert_attendance(name, timestamp, status):
    cur = mysql.connection.cursor()
    cur.execute(
        "INSERT INTO attendance_records (name, timestamp, status) VALUES (%s, %s, %s)",
        (name, timestamp, status)
    )
    mysql.connection.commit()
    cur.close()
