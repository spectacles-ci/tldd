# Use the official Python image as a base image
FROM python:3.10-slim

# Set environment variables
ENV POETRY_VERSION=1.7.1

# Install Poetry
RUN pip install "poetry==$POETRY_VERSION"

# Set the working directory
WORKDIR /app

# Copy the pyproject.toml and poetry.lock files
COPY pyproject.toml poetry.lock ./

# Install the dependencies
RUN poetry install --no-root

# Copy the rest of the application code
COPY . .
RUN poetry install --without dev --no-interaction --no-ansi -vvv

# Expose the port the app runs on
EXPOSE 8000

# Run the application
CMD ["poetry", "run", "start"]
