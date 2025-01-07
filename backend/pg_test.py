import os

import psycopg2
from dotenv import load_dotenv

load_dotenv()

try:
    # Connect to your postgres DB
    conn = psycopg2.connect(
        dbname="postgres",
        user="postgres",
        password=os.getenv('POSTGRES_PASSWORD'),
        host="localhost",
        port="5432"
    )

    # Create a cursor
    cur = conn.cursor()

    # Execute a test query
    cur.execute("SELECT version();")

    # Fetch the result
    version = cur.fetchone()
    print("PostgreSQL version:", version)

    # Close communication
    cur.close()
    conn.close()

except psycopg2.Error as e:
    print("Error connecting to PostgreSQL:", e)
