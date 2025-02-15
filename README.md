# Project Name

This is a Node.js project built with Prisma, Docker, and Swagger for API documentation. Below are the instructions to set up and run the project.

---

## Prerequisites

- **Node.js**: Version 20 or higher.
- **Docker**: Ensure Docker and Docker Compose are installed on your machine.
- **npm**: Node Package Manager (comes with Node.js).

---

## Getting Started

### 1. Clone the Repository

Clone the project repository to your local machine:

```bash
git clone https://github.com/Biswajit11mondal/todo.git
cd todo
```


Set Up the Project:

## Start Docker Container
Run the following command to start the Docker containers :

```bash
docker-compose up -d
```
## install dependence
```bash
npm install
```
## Build the Project
Build the project using the following command:

```bash
npm run build
```
## Seed the Database
Seed the database with the initial admin user:

```bash
npm run seed
```
## This will create the first user with the following credentials:

Email: abc@mail.com

Password: Abc@1234

Role: Admin

## Run the Project
Start the project in development mode:

```bash
npm run start
```
## API Documentation
The project includes Swagger documentation for the API. To access the documentation, open your browser and navigate to:

```browser
{baseurl}/api
```
Replace {baseurl} with your server's base URL (e.g., http://localhost:5000).

## Project Structure
src/: Contains the source code for the application.

prisma/: Contains Prisma schema and migrations.

docker-compose.yml: Docker configuration for the database and other services.

package.json: Lists project dependencies and scripts.

## Environment Variables
Create a .env file in the root directory and add the following variables:

DATABASE_URL=postgresql://postgres:password@localhost:5432/todo?schema=public
PORT=5000
