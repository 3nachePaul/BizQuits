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

## Sprint 2

**Interval**: 30 noiembrie - 12 decembrie

**Scop**: Dezvoltarea elementelor necesare pentru adăugarea și vizualizarea ofertelor.

### Obiective specifice

#### 1. Crearea paginii de activitate a antreprenorilor și formularul de adăugare a ofertelor

**a. Crearea paginii de activitate a antreprenorilor**

**b. Implementarea funcționalității de adăugare a ofertelor**
- Antreprenorul creează o ofertă nouă, introducând detalii precum titlu, descriere, categorie, durată de valabilitate pentru a promova produsele sau serviciile oferite.
- Sistemul afișează un formular de creare cu câmpuri pentru titlu, descriere, categorie, durată și alte detalii specifice pentru ca antreprenorul să poată introduce informațiile necesare.

#### 2. Crearea paginii de vizualizare a ofertelor pentru clienți
- Utilizatorul navighează printr-o listă cu toate ofertele disponibile pentru a vedea opțiunile din platformă.
- Interfața permite utilizatorului să selecteze criterii de filtrare (categorie/tip/locație) a listelor de oferte și joburi pentru a restrânge lista cu elemente de interes.
- Interfața permite utilizatorului să sorteze lista de oferte și joburi (după dată, recompense) pentru a vizualiza elementele în ordinea preferată.

#### 3. Sistemul de rezervări (Booking System)
- **Clienții** pot rezerva servicii prin butonul "Book Now" și pot adăuga un mesaj opțional.
- **Antreprenorii** văd cererile de rezervare în dashboard-ul lor și pot accepta sau respinge.
- **Fluxul de lucru:**
  1. Client face rezervare → Status: Pending
  2. Antreprenor acceptă → Status: Accepted
  3. Antreprenor începe lucrul → Status: InProgress
  4. Client confirmă finalizarea → Status: Completed
- Ambele părți pot anula rezervările (cu restricții bazate pe status).

#### 4. Activități de testare
- Testarea manuală a funcționalităților integrate

#### 5. Activități de dezvoltare
- Dezvoltarea paginii de activitate a antreprenorilor (frontend, backend)
- Dezvoltarea funcționalității de adăugare a ofertelor (frontend, backend)
- Dezvoltarea funcționalității de vizualizare a ofertelor (frontend, backend)
- Dezvoltarea sistemului de rezervări (frontend, backend)

#### 6. Activități de învățare
- Urmărirea de tutoriale video și citirea articolelor pentru a aprofunda tehnologiile alese pentru dezvoltarea aplicației și pentru a rezolva probleme întâmpinate
- Sesiune de mentorat dacă echipa are nevoie de ajutor suplimentar

---

## Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://www.docker.com/)

### Quick Start

The easiest way to start the entire application:

```bash
./start.sh
```

This will:
1. Start the SQL Server database in Docker
2. Apply database migrations
3. Start the backend API (http://localhost:5204)
4. Start the frontend (http://localhost:5173)

Press `Ctrl+C` to stop all services.

### Manual Setup

#### Database Setup (Docker)

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
│   ├── Controllers/          # API Controllers (Auth, Admin, User, Service, Booking)
│   ├── Data/                 # Database Context & Migrations
│   ├── DTOs/                 # Data Transfer Objects
│   ├── Models/               # Entity Models (User, EntrepreneurProfile, Service, Booking)
│   └── Services/             # Business Logic Services
├── bizquits.frontend/        # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI Components
│   │   ├── context/          # React Context (Auth)
│   │   ├── pages/            # Page Components
│   │   ├── services/         # API Service Layer
│   │   └── styles/           # CSS Styles
│   └── public/               # Static Assets
├── database/                 # Database initialization scripts
├── start.sh                  # Quick start script
├── docker-compose.yml        # Docker configuration
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
