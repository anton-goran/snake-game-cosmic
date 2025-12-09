# Stage 1: Build Frontend
FROM node:22-alpine as frontend_build

WORKDIR /frontend_app

COPY Frontend/package.json Frontend/package-lock.json* ./
RUN npm install

COPY Frontend/ .
# Ensure production build
RUN npm run build

# Stage 2: Backend + Serving
FROM python:3.12-slim

WORKDIR /app

# Install uv
RUN pip install uv

# Copy backend dependency files
COPY Backend/pyproject.toml Backend/uv.lock ./

# Install dependencies
RUN uv sync --frozen

# Copy backend code
COPY Backend/ .

# Copy built frontend assets to Backend/static
# Vite builds to 'dist', so we copy from there to 'static'
COPY --from=frontend_build /frontend_app/dist ./static

# Copy entrypoint (assumed to be in Backend/ from COPY Backend/ .)
# But we should ensure it is executable
RUN chmod +x entrypoint.sh

# Expose port
EXPOSE 8000

# Run using entrypoint (migrations + start)
CMD ["./entrypoint.sh"]
