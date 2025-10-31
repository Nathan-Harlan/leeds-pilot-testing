# Use a lightweight Python base image
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Copy dependency file first (to leverage Docker layer caching)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Default command — matches your compose file
CMD ["python", "system-control.py"]
