FROM python:3.12-slim

WORKDIR /app

# Install uv
RUN pip install uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies (system-wide for Docker)
RUN uv sync --frozen

# Copy application code
COPY . .

# Copy and set entrypoint
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Expose port
EXPOSE 8000

# Run application
CMD ["./entrypoint.sh"]
