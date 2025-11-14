# =================================================================
# Dockerfile for Clinico AI Service (Python/Flask with Poetry)
# Optimized for low disk space
# =================================================================

FROM python:3.12-slim

WORKDIR /app

# Install only essential system dependencies (curl only, no build tools)
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install --no-cache-dir poetry==1.8.3

# Configure Poetry
RUN poetry config virtualenvs.create false

# Copy poetry files
COPY pyproject.toml poetry.lock* ./

# Install Python dependencies
# This will try Poetry first, fallback to pip if needed
RUN poetry install --no-interaction --no-ansi || \
    (poetry export -f requirements.txt --output requirements.txt --without-hashes && \
    pip install --no-cache-dir -r requirements.txt)

# Copy application code
COPY . .

# Create necessary directories and fix permissions
RUN mkdir -p db knowledge_base && \
    chmod -R 777 /app

# Set Python path
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5001/health || exit 1

# Run Flask
CMD ["poetry", "run", "python", "-m", "flask", "--app", "main", "run", "--host", "0.0.0.0", "--port", "5001"]