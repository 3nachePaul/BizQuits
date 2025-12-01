# BizQuits

A web application for connecting entrepreneurs with clients, featuring user authentication, account approval workflows, and service management.

## Tech Stack

- **Backend**: ASP.NET Core (.NET 10)
- **Frontend**: React + Vite
- **Database**: SQL Server (Docker)

---

## Sprint 1

**Interval**: 17 noiembrie - 29 noiembrie

**Scop**: Dezvoltarea elementelor de bază ale aplicației (înregistrare, autentificare, panou de aprobare al conturilor noi)

### Obiective specifice

#### 1. Crearea contului de utilizator și autentificarea în aplicație

**a. Crearea bazei de date cu rolurile existente**

**b. Implementarea funcționalității de înregistrare**
- Utilizatorul introduce datele sale personale pentru a-și crea un cont nou.
- Sistemul afișează elemente de feedback pozitiv (mesaj de confirmare/culori și iconițe sugestive) după crearea contului pentru ca utilizatorul să știe că înregistrarea s-a realizat cu succes.
- Sistemul afișează un text roșu sub câmpurile din formular completate cu date invalide pentru ca utilizatorul să știe ce trebuie să modifice.

**c. Implementarea funcționalității de autentificare**
- Utilizatorul se autentifică folosind email-ul și parola pentru a accesa zona de oferte și joburi.
- Sistemul afișează un mesaj clar care include textul erorii și o iconiță sugestivă pentru a informa utilizatorul că autentificarea nu a avut succes.

#### 2. Aprobarea conturilor create

**a. Crearea paginii pentru aprobarea conturilor**
- Interfața sistemului afișează o listă cu conturile noi făcute de către antreprenori pentru ca administratorii să le vizualizeze.

**b. Implementarea logicii de aprobare a unui cont**
- Interfața sistemului afișează în dreptul conturilor noi făcute de către antreprenori un buton de validare și unul de respingere pentru ca administratorii să confirme autenticitatea firmelor.

#### 3. Activități de testare
- Testarea manuală a funcționalităților integrate

#### 4. Activități de dezvoltare
- Configurarea bazei de date
- Dezvoltarea funcționalității de înregistrare (frontend, backend)
- Dezvoltarea funcționalității de autentificare (frontend, backend)
- Dezvoltarea funcționalității de aprobare a conturilor (frontend, backend)

#### 5. Activități de învățare
- Urmărirea de tutoriale video și citirea articolelor pentru a învăța și a aprofunda tehnologiile alese pentru dezvoltarea aplicației

---

## Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://www.docker.com/)

### Database Setup (Docker)

Run SQL Server in a Docker container:

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Passw0rd" \
  -p 1433:1433 --name bizquits-db \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

### Backend Setup

```bash
cd BizQuits
dotnet restore
dotnet ef database update
dotnet run
```

### Frontend Setup

```bash
cd bizquits.frontend
npm install
npm run dev
```

---

## Project Structure

```
BizQuits/
├── BizQuits/                 # ASP.NET Core Backend
│   ├── Controllers/          # API Controllers
│   ├── Data/                 # Database Context & Migrations
│   ├── DTOs/                 # Data Transfer Objects
│   ├── Models/               # Entity Models
│   └── Services/             # Business Logic Services
├── bizquits.frontend/        # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI Components
│   │   ├── context/          # React Context (Auth)
│   │   ├── pages/            # Page Components
│   │   ├── services/         # API Service Layer
│   │   └── styles/           # CSS Styles
│   └── public/               # Static Assets
└── README.md
```

---

## Team Collaboration

### Sharing the Database Container

To make sure everyone on our team is working with the same database setup, we used a shared Docker configuration with the following settings:

- **Container name:** `bizquits-db`
- **Port:** `1433`
- **Password:** *(shared securely within the team)*

We started the database using the Docker command shown above, and we also configured it so it can be brought up with:

```sh
docker-compose up -d
```




---

## License

This project is for educational purposes.
