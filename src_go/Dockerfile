# Use the official Golang image as the base image
FROM golang:1.22-alpine

# Set environment variables for Go
ENV GO111MODULE=on

# Install dependencies
RUN apk update && apk add --no-cache git

# Set the working directory
WORKDIR /app

# Copy go.mod and go.sum and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the application code
COPY . .

# Build the application
RUN go build -o main .

# Expose the port that the app will run on
EXPOSE 8080

# Set the entry point for the container
CMD ["./main"]
