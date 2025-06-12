# app/db.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "mysql+pymysql://root@localhost/your_db_name"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
