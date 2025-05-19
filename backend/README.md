
# Backend API Documentation

## Overview

This is a backend API built with FastAPI for managing user registrations, job vacancies, applications, and HR management. The API supports authentication via JWT tokens, role-based access control for Admin, HR, and Users, and integrates with Azure Blob Storage for resume uploads.

---

## Project Structure
```
hr-analyzer/
├── backend/
│   ├── src/
│   │   ├── admin/
│   │   │   ├── services/
│   │   │   │   ├── admin_service.py
│   │   │   │   ├── hr_admin_service.py
│   │   │   │   ├── user_admin_service.py
│   │   │   ├── crud.py
│   │   │   ├── dependencies.py
│   │   │   ├── router.py
│   │   │   ├── schemas.py
│   │   ├── application/
│   │   │   ├── crud.py
│   │   │   ├── schemas.py
│   │   │   ├── service.py
│   │   ├── auth/
│   │   │   ├── config.py
│   │   │   ├── constants.py
│   │   │   ├── dependencies.py
│   │   │   ├── router.py
│   │   │   ├── schemas.py
│   │   │   ├── service.py
│   │   │   ├── utils.py
│   │   ├── base/
│   │   │   ├── service.py
│   │   ├── hh_integration/
│   │   ├── hr/
│   │   │   ├── crud.py
│   │   │   ├── dependencies.py
│   │   │   ├── router.py
│   │   │   ├── schemas.py
│   │   │   ├── service.py
│   │   ├── resume/
│   │   │   ├── crud.py
│   │   │   ├── schemas.py
│   │   │   ├── service.py
│   │   ├── user/
│   │   │   ├── crud.py
│   │   │   ├── dependencies.py
│   │   │   ├── router.py
│   │   │   ├── schemas.py
│   │   │   ├── service.py
│   │   │   ├── utils.py
│   │   │   ├── validation.py
│   │   ├── vacancy/
│   │   │   ├── crud.py
│   │   │   ├── schemas.py
│   │   │   ├── service.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── routers.py
│   ├── backend.dockerfile
│   ├── requirements.txt
├── frontend/
├── database/
├── .env.example
├── docker-compose.yml
```

## Services

### AdminService
- Manages platform administrators.
- Retrieves admin information by email or ID.
- Includes helper services for interacting with HR and users.

### HRAdminService
- Manages HR managers.
- Retrieves all HRs and pending HRs for approval.
- Allows retrieval of HRs by ID.
- Deletes HRs.
- Approves pending HRs.
- Blocks or unblocks HRs.

### UserAdminService
- Manages platform users.
- Retrieves all users.
- Allows retrieval of users by ID.
- Deletes users.
- Blocks or unblocks users.

### ApplicationService
- Manages job application submissions.
- Analyzes resumes and job matching using AI.
- Creates applications from users.
- Accepts or rejects candidates based on their applications.
- Retrieves the list of applications made by users.

### AuthService
- Manages authentication and registration for users, HRs, and admins.
- Registers users and HRs.
- Authenticates users, HRs, and admins.
- Verifies account status (block or approval for HRs).
- Generates and verifies JWT tokens (access and refresh).

### HRService
- Manages HR profiles and accounts.
- Creates HR accounts with password hashing.
- Retrieves HR data by ID or email.
- Updates HR profiles.
- Deletes HR accounts.
- Provides HR profile information.

### UserService
- Manages user accounts.
- Creates users with email verification and password hashing.
- Retrieves user data by ID or email.

### ResumeService
- Manages resume uploads and processing.
- Uploads resumes to Azure Blob Storage and retrieves links.
- Extracts text from PDF resumes.
- Analyzes resumes using OpenAI for key information extraction.
- Converts salary data to KZT using exchange rates.
- Saves processed resumes in the database.
- Retrieves resumes by user ID or resume ID.

### VacancyService
- Manages job vacancies.
- Creates, updates, deletes, and retrieves vacancies.
- Manages vacancy status (e.g., "Under Review", "Accepted").
- Retrieves candidates for each vacancy.
- Retrieves vacancies applied by candidates.

---

## Endpoints

### Authentication Endpoints

- **POST** `/api/v1/auth/login`  
  Login with username and password to receive JWT tokens.
  
- **POST** `/api/v1/auth/register/user`  
  Register a new user.

- **POST** `/api/v1/auth/register/hr`  
  Register a new HR.

- **POST** `/api/v1/auth/refresh`  
  Refresh the JWT token.

---

### Admin Endpoints

- **GET** `/api/v1/admin/users`  
  Retrieve all users.

- **DELETE** `/api/v1/admin/users/{user_id}`  
  Delete a user by ID.

- **PUT** `/api/v1/admin/toggle-block/user/{user_id}`  
  Toggle the block status of a user.

- **GET** `/api/v1/admin/hrs`  
  Retrieve all HRs.

- **GET** `/api/v1/admin/hrs/pending`  
  Retrieve all pending HRs for approval.

- **GET** `/api/v1/admin/hrs/{hr_id}`  
  Retrieve HR by ID.

- **DELETE** `/api/v1/admin/hrs/{hr_id}`  
  Delete an HR by ID.

- **PUT** `/api/v1/admin/approve/hr/{hr_id}`  
  Approve an HR by ID.

- **PUT** `/api/v1/admin/toggle-block/hr/{hr_id}`  
  Toggle the block status of an HR.

- **PATCH** `/api/v1/admin/{vacancy_id}/status`  
  Change the status of a vacancy.

- **GET** `/api/v1/admin/vacancies/review`  
  Get all vacancies under review.

---

### HR Endpoints

- **GET** `/api/v1/hr/me`  
  Retrieve HR profile.

- **PUT** `/api/v1/hr/me`  
  Update HR profile.

- **DELETE** `/api/v1/hr/me`  
  Delete HR account.

- **GET** `/api/v1/hr/{vacancy_id}`  
  Retrieve a vacancy by ID.

- **PUT** `/api/v1/hr/{vacancy_id}`  
  Update a vacancy by ID.

- **DELETE** `/api/v1/hr/{vacancy_id}`  
  Delete a vacancy by ID.

- **POST** `/api/v1/hr/`  
  Create a new vacancy.

- **GET** `/api/v1/hr/`  
  Retrieve all vacancies for HR.

- **GET** `/api/v1/hr/vacancy/{vacancy_id}`  
  Retrieve candidates for a specific vacancy.

- **POST** `/api/v1/hr/applications/{application_id}/accept`  
  Accept a candidate application.

- **POST** `/api/v1/hr/applications/{application_id}/reject`  
  Reject a candidate application.

---

### User Endpoints

- **GET** `/api/v1/user/profile`  
  Retrieve user profile.

- **GET** `/api/v1/user/accepted`  
  Retrieve all accepted vacancies for a user.

- **GET** `/api/v1/user/accepted/{vacancy_id}`  
  Retrieve an accepted vacancy by ID.

- **POST** `/api/v1/user/`  
  Upload a resume.

- **GET** `/api/v1/user/`  
  Retrieve all resumes for a user.

- **GET** `/api/v1/user/{resume_id}`  
  Retrieve a resume by ID.

- **POST** `/api/v1/user/applications/`  
  Create a job application.

- **GET** `/api/v1/user/applications/`  
  Retrieve all applications submitted by the user.

- **GET** `/api/v1/user/user/{user_id}/vacancies`  
  Retrieve all vacancies a user has applied to.

- **GET** `/api/v1/user/user/{user_id}/vacancies/details`  
  Retrieve detailed information about a vacancy the user applied to.

---

## Setup

### Requirements

Install the required dependencies:

```bash
pip install -r requirements.txt
```

### Docker Setup

1. **Build Docker Containers**  
   Run the following command to build the Docker containers:

   ```bash
   docker-compose up --build
   ```

2. **Start the Services**  
   Once the build is complete, start the services with:

   ```bash
   docker-compose up
   ```

3. **Access the API**  
   The FastAPI app will be available at `http://localhost:8000`.

---


### Configuration

You will need to create a `.env` file in the root directory of your project. You can use the `.env.example` file provided as a template.

```bash
cp .env.example .env
```

Make sure to update the `.env` file with your own values for things like database connection strings, Azure credentials, and so on.

---

## Acknowledgments

- **FastAPI** - For providing a modern and fast web framework.
- **Azure Blob Storage** - For handling resume uploads.
- **OpenAI** - For resume analysis and key information extraction.
- **SQLAlchemy** - For ORM-based database interaction.
- **JWT** - For secure token-based authentication.
- **Docker** - For containerization and easy deployment.

---

## Conclusion

This backend API provides comprehensive features for managing users, HRs, vacancies, and applications in a structured and secure way using FastAPI. The system is designed for flexibility, scalability, and easy integration with services like Azure Blob Storage.
