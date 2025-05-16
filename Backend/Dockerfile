FROM python:3.13.3-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN mkdir -p logs
COPY main.py .
CMD ["python", "-m", "gunicorn", "--workers", "5", "--threads", "2", "--bind", "0.0.0.0:5000",  "--access-logfile", "logs/gunicorn-access.log", "--error-logfile", "logs/gunicorn-error.log", "main:app"]

