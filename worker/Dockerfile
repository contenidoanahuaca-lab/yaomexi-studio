FROM python:3.10-slim

# Create worker directory
WORKDIR /worker

# Install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the worker source code
COPY . .

CMD ["python", "worker.py"]