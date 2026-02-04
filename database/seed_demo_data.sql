-- BizQuits Demo Data for Presentation
-- =====================================
-- App Purpose: Temporary one-day jobs (HORECA, Events, Figuration, Promotions)
-- Universal Password: Demo123!
-- BCrypt Hash: $2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO

USE BizQuits;
GO

-- Clear existing data (in reverse dependency order)
DELETE FROM Messages;
DELETE FROM Reviews;
DELETE FROM ChallengeParticipations;
DELETE FROM Challenges;
DELETE FROM OfferClaims;
DELETE FROM Offers;
DELETE FROM Bookings;
DELETE FROM Services;
DELETE FROM ClientStats;
DELETE FROM UserAchievements;
DELETE FROM EntrepreneurProfiles;
DELETE FROM RefreshTokens;
DELETE FROM Users;
GO

-- Reset identity columns
DBCC CHECKIDENT ('Users', RESEED, 0);
DBCC CHECKIDENT ('EntrepreneurProfiles', RESEED, 0);
DBCC CHECKIDENT ('Services', RESEED, 0);
DBCC CHECKIDENT ('Bookings', RESEED, 0);
DBCC CHECKIDENT ('Offers', RESEED, 0);
DBCC CHECKIDENT ('Challenges', RESEED, 0);
DBCC CHECKIDENT ('Reviews', RESEED, 0);
DBCC CHECKIDENT ('Messages', RESEED, 0);
DBCC CHECKIDENT ('ClientStats', RESEED, 0);
GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- USERS (Role: 0=Client, 1=Entrepreneur, 2=Admin)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Admin Users
INSERT INTO Users (Email, PasswordHash, Role) VALUES
('admin@bizquits.ro', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 2);

-- Entrepreneur Users (Companies needing temporary workers)
INSERT INTO Users (Email, PasswordHash, Role) VALUES
-- HORECA
('hr@hardrockcafe.ro', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 1),
('jobs@citygrillbucharest.ro', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 1),
('angajari@grandhotelcontinental.ro', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 1),
('contact@cateringexpert.ro', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 1),
-- Events & Conferences
('staff@romexpo.ro', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 1),
('hr@evenimentebucuresti.ro', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 1),
-- Figuration & Casting
('casting@castelfilm.ro', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 1),
('figuranti@mediapro.ro', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 1),
-- Retail & Promotions
('promotii@mccann.ro', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 1),
('sampling@streetpromo.ro', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 1);

-- Client Users (People looking for temporary work)
INSERT INTO Users (Email, PasswordHash, Role) VALUES
('ion.popescu@gmail.com', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 0),
('maria.ionescu@yahoo.com', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 0),
('alexandru.popa@outlook.com', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 0),
('elena.dumitrescu@gmail.com', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 0),
('andrei.stan@icloud.com', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 0),
('cristina.marin@gmail.com', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 0),
('bogdan.vasile@yahoo.com', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 0),
('diana.radu@gmail.com', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 0);

GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- ENTREPRENEUR PROFILES
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO EntrepreneurProfiles (UserId, CompanyName, CUI, IsApproved) VALUES
(2, 'Hard Rock Cafe București', 'RO16529870', 1),
(3, 'City Grill', 'RO14307432', 1),
(4, 'Grand Hotel Continental', 'RO1590430', 1),
(5, 'Catering Expert SRL', 'RO28456123', 1),
(6, 'Romexpo SA', 'RO1555301', 1),
(7, 'Evenimente București SRL', 'RO31245678', 1),
(8, 'Castel Film Studios', 'RO6789054', 1),
(9, 'MediaPro Pictures', 'RO9423870', 1),
(10, 'McCann România', 'RO1572506', 1),
(11, 'Street Promo Agency', 'RO35678901', 1);

GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- SERVICES (Temporary job opportunities)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Hard Rock Cafe (EntrepreneurProfileId = 1)
INSERT INTO Services (Name, Description, Category, Duration, Price, IsActive, CreatedAt, EntrepreneurProfileId) VALUES
('Ospătar Weekend', 'Căutăm ospătari pentru ture de weekend (V-D). Experiență preferată dar nu obligatorie. Oferim training la început de tură. Uniformă asigurată.', 'HORECA', '8 ore', 180.00, 1, DATEADD(day, -60, GETUTCDATE()), 1),
('Barman Evenimente Speciale', 'Barman pentru evenimente tematice și concerte live. Experiență minimă 6 luni necesară. Bonus pentru cunoașterea cocktail-urilor clasice.', 'HORECA', '6-10 ore', 220.00, 1, DATEADD(day, -55, GETUTCDATE()), 1),
('Runner Bucătărie', 'Ajutor bucătărie pentru transport preparate și menținere curățenie. Fără experiență necesară. Energie și viteză sunt esențiale!', 'HORECA', '8 ore', 150.00, 1, DATEADD(day, -45, GETUTCDATE()), 1);

-- City Grill (EntrepreneurProfileId = 2)
INSERT INTO Services (Name, Description, Category, Duration, Price, IsActive, CreatedAt, EntrepreneurProfileId) VALUES
('Ospătar Restaurant', 'Personal ospătari pentru locațiile din centru. Ture disponibile: prânz (11-17) sau seară (17-24). Experiență în HoReCa preferată.', 'HORECA', '6-7 ore', 160.00, 1, DATEADD(day, -50, GETUTCDATE()), 2),
('Hostess Restaurant', 'Hostess pentru întâmpinare clienți și gestionare rezervări. Aspect îngrijit, comunicare excelentă. Training asigurat.', 'HORECA', '8 ore', 170.00, 1, DATEADD(day, -48, GETUTCDATE()), 2),
('Ajutor Bucătar Linie', 'Pregătire ingrediente și asistență bucătari la linia caldă. Experiență de bază în bucătărie necesară.', 'HORECA', '8 ore', 175.00, 1, DATEADD(day, -40, GETUTCDATE()), 2);

-- Grand Hotel Continental (EntrepreneurProfileId = 3)
INSERT INTO Services (Name, Description, Category, Duration, Price, IsActive, CreatedAt, EntrepreneurProfileId) VALUES
('Ospătar Banchet', 'Personal pentru banchete și evenimente corporate. Experiență în servire la masă formală. Ținută elegantă asigurată.', 'HORECA', '8-10 ore', 200.00, 1, DATEADD(day, -42, GETUTCDATE()), 3),
('Room Service', 'Personal pentru livrare room service. Discreție și profesionalism. Program flexibil, ture de 8 ore.', 'HORECA', '8 ore', 165.00, 1, DATEADD(day, -38, GETUTCDATE()), 3),
('Bell Boy / Concierge Asistent', 'Asistență la recepție și bagaje. Engleză conversațională obligatorie. Aspect profesional.', 'HORECA', '8 ore', 160.00, 1, DATEADD(day, -30, GETUTCDATE()), 3);

-- Catering Expert (EntrepreneurProfileId = 4)
INSERT INTO Services (Name, Description, Category, Duration, Price, IsActive, CreatedAt, EntrepreneurProfileId) VALUES
('Ospătar Catering Evenimente', 'Personal pentru evenimente private și corporate (nunți, botezuri, gale). Transport asigurat. Masă inclusă.', 'HORECA', '6-12 ore', 190.00, 1, DATEADD(day, -45, GETUTCDATE()), 4),
('Ajutor Bucătărie Catering', 'Preparare aperitive, porționare, împachetare. Nu e necesară experiență, doar viteză și atenție.', 'HORECA', '8 ore', 145.00, 1, DATEADD(day, -40, GETUTCDATE()), 4),
('Barista Evenimente', 'Preparare cafea la stație mobilă pentru evenimente corporate. Experiență ca barista necesară.', 'HORECA', '6-8 ore', 180.00, 1, DATEADD(day, -32, GETUTCDATE()), 4);

-- Romexpo (EntrepreneurProfileId = 5)
INSERT INTO Services (Name, Description, Category, Duration, Price, IsActive, CreatedAt, EntrepreneurProfileId) VALUES
('Staff Informații Expoziție', 'Personal pentru ghidare vizitatori și informații generale la târguri și expoziții. Training inclus.', 'Evenimente', '8 ore', 155.00, 1, DATEADD(day, -50, GETUTCDATE()), 5),
('Hostess Stand Expozanți', 'Hostess pentru standuri expozanți. Aspect plăcut, comunicare excelentă. Engleză este un plus.', 'Evenimente', '8 ore', 175.00, 1, DATEADD(day, -35, GETUTCDATE()), 5),
('Personal Acreditări & Check-in', 'Scanare badge-uri, verificare liste, distribuire materiale. Atenție la detalii esențială.', 'Evenimente', '10 ore', 160.00, 1, DATEADD(day, -28, GETUTCDATE()), 5);

-- Evenimente București (EntrepreneurProfileId = 6)
INSERT INTO Services (Name, Description, Category, Duration, Price, IsActive, CreatedAt, EntrepreneurProfileId) VALUES
('Hostess Gală / Eveniment Corporate', 'Hostess pentru gale, premiere, evenimente VIP. Experiență anterioară, aspect impecabil. Ținută furnizată.', 'Evenimente', '6-8 ore', 200.00, 1, DATEADD(day, -55, GETUTCDATE()), 6),
('Staff Tehnic Sunet/Lumini', 'Ajutor montaj/demontaj echipamente pentru concerte și evenimente. Forță fizică necesară.', 'Evenimente', '10-14 ore', 250.00, 1, DATEADD(day, -40, GETUTCDATE()), 6),
('Coordonator Parcare', 'Ghidare mașini și gestionare flux trafic la evenimente mari. Comunicare și rezistență la stres.', 'Evenimente', '8 ore', 140.00, 1, DATEADD(day, -25, GETUTCDATE()), 6);

-- Castel Film Studios (EntrepreneurProfileId = 7)
INSERT INTO Services (Name, Description, Category, Duration, Price, IsActive, CreatedAt, EntrepreneurProfileId) VALUES
('Figurant Film/Serial', 'Figurație pentru producții românești și internaționale. Fără experiență necesară. Machiaj și costume asigurate.', 'Figuration', '8-12 ore', 200.00, 1, DATEADD(day, -60, GETUTCDATE()), 7),
('Figurant cu Mașină', 'Figurație cu mașina personală în scenă. Mașini diverse necesare. Bonus pentru mașini de epocă sau premium.', 'Figuration', '6-10 ore', 350.00, 1, DATEADD(day, -50, GETUTCDATE()), 7),
('Silhouette / Blur', 'Siluete pentru planuri îndepărtate sau blur. Plată rapidă, fără casting. Diverse vârste și aspecte.', 'Figuration', '4-6 ore', 120.00, 1, DATEADD(day, -45, GETUTCDATE()), 7);

-- MediaPro Pictures (EntrepreneurProfileId = 8)
INSERT INTO Services (Name, Description, Category, Duration, Price, IsActive, CreatedAt, EntrepreneurProfileId) VALUES
('Figurant Reclamă TV', 'Figurație pentru spoturi publicitare. Diverse profiluri căutate. Casting rapid, filmare 1 zi.', 'Figuration', '6-10 ore', 250.00, 1, DATEADD(day, -45, GETUTCDATE()), 8),
('Figurant Videoclip Muzical', 'Figurație pentru videoclipuri artiști români. Aspect tânăr, energie, dans de bază este un plus.', 'Figuration', '8-12 ore', 180.00, 1, DATEADD(day, -35, GETUTCDATE()), 8),
('Stand-in / Photo Double', 'Stand-in pentru actori principali la setarea luminilor. Înălțime și constituție similare cu actorul.', 'Figuration', '8 ore', 300.00, 1, DATEADD(day, -30, GETUTCDATE()), 8);

-- McCann România (EntrepreneurProfileId = 9)
INSERT INTO Services (Name, Description, Category, Duration, Price, IsActive, CreatedAt, EntrepreneurProfileId) VALUES
('Promoter Mall / Magazin', 'Promovare produse în mall-uri și hipermarketuri. Training pe produs inclus. Comunicativ și energic.', 'Promotii', '6-8 ore', 140.00, 1, DATEADD(day, -50, GETUTCDATE()), 9),
('Hostess Lansare Produs', 'Hostess pentru lansări de produse și evenimente brand. Aspect îngrijit, capacitate de prezentare.', 'Promotii', '6 ore', 180.00, 1, DATEADD(day, -40, GETUTCDATE()), 9),
('Demonstrator Produs', 'Demonstrații de produse în magazine. Training complet oferit. Ideal pentru produse tech sau cosmetice.', 'Promotii', '8 ore', 170.00, 1, DATEADD(day, -30, GETUTCDATE()), 9);

-- Street Promo Agency (EntrepreneurProfileId = 10)
INSERT INTO Services (Name, Description, Category, Duration, Price, IsActive, CreatedAt, EntrepreneurProfileId) VALUES
('Sampling Stradal / Flyering', 'Distribuire mostre și fluturași în zone aglomerate. Rezistență la stat în picioare, comunicativ.', 'Promotii', '6 ore', 120.00, 1, DATEADD(day, -55, GETUTCDATE()), 10),
('Brand Ambassador Eveniment', 'Reprezentare brand la festivaluri și evenimente publice. Training pe brand, tricou furnizat.', 'Promotii', '8-10 ore', 160.00, 1, DATEADD(day, -40, GETUTCDATE()), 10),
('Echipa Street Marketing', 'Activări de guerrilla marketing în oraș. Creativitate și energie. Ideal pentru studenți.', 'Promotii', '4-6 ore', 130.00, 1, DATEADD(day, -25, GETUTCDATE()), 10);

GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- CLIENT STATS (for gamification - tracking worker reliability)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO ClientStats (UserId, Xp, Level, TotalBookingsCreated, TotalBookingsCompleted, UpdatedAt) VALUES
(12, 1250, 6, 25, 23, DATEADD(day, -1, GETUTCDATE())),
(13, 720, 4, 15, 14, DATEADD(day, -3, GETUTCDATE())),
(14, 380, 3, 8, 7, DATEADD(day, -5, GETUTCDATE())),
(15, 180, 2, 4, 4, DATEADD(day, -7, GETUTCDATE())),
(16, 950, 5, 20, 18, DATEADD(day, -2, GETUTCDATE())),
(17, 95, 1, 2, 2, DATEADD(day, -10, GETUTCDATE())),
(18, 520, 4, 12, 11, DATEADD(day, -4, GETUTCDATE())),
(19, 880, 5, 18, 17, DATEADD(day, -1, GETUTCDATE()));

GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- BOOKINGS (Status: 0=Pending, 1=Accepted, 2=Rejected, 3=InProgress, 4=Completed, 5=Cancelled)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Completed bookings (past jobs done)
INSERT INTO Bookings (ClientId, ServiceId, Status, Message, EntrepreneurResponse, CreatedAt, StartDate, CompletedDate) VALUES
(12, 1, 4, 'Bună! Am experiență de 2 ani în HoReCa, fostul meu loc de muncă a fost la Marriott. Sunt disponibil weekendul acesta.', 'Perfect! Te așteptăm sâmbătă la ora 10 pentru briefing. Adu CI pentru contract.', DATEADD(day, -45, GETUTCDATE()), DATEADD(day, -43, GETUTCDATE()), DATEADD(day, -43, GETUTCDATE())),
(12, 10, 4, 'Am lucrat catering de mai multe ori, cunosc procedurile de servire la evenimente formale.', 'Excelent background! Evenimentul e sâmbăta viitoare, nuntă la Palatul Știrbey.', DATEADD(day, -40, GETUTCDATE()), DATEADD(day, -38, GETUTCDATE()), DATEADD(day, -38, GETUTCDATE())),
(13, 14, 4, 'Sunt studentă și caut job-uri flexibile. Am lucrat la 3 expoziții anul trecut.', 'Super! Avem nevoie de tine la Târgul de Turism. Training marți la 18:00.', DATEADD(day, -35, GETUTCDATE()), DATEADD(day, -34, GETUTCDATE()), DATEADD(day, -34, GETUTCDATE())),
(14, 19, 4, 'Sunt disponibil pentru figurație. Înălțime 1.80m, brunet. Am mai făcut figurație la ProTV.', 'Perfect pentru scena de restaurant. Filmăm joi la Castel Film.', DATEADD(day, -30, GETUTCDATE()), DATEADD(day, -28, GETUTCDATE()), DATEADD(day, -28, GETUTCDATE())),
(15, 25, 4, 'Sunt comunicativă și îmi place să interacționez cu oamenii. Prima experiență ca promoter.', 'Te așteptăm la training luni. Campania e pentru un nou telefon Samsung.', DATEADD(day, -25, GETUTCDATE()), DATEADD(day, -24, GETUTCDATE()), DATEADD(day, -24, GETUTCDATE())),
(16, 2, 4, 'Barman cu 4 ani experiență, cunosc cocktailuri clasice și moderne. Disponibil pentru concert Cargo.', 'Awesome! Te așteptăm vineri la 17:00 pentru sound check și setup bar.', DATEADD(day, -20, GETUTCDATE()), DATEADD(day, -19, GETUTCDATE()), DATEADD(day, -19, GETUTCDATE())),
(16, 7, 4, 'Experiență banchet la Intercontinental și Marriott. Cunosc protocolul de servire formală.', 'Exact ce căutam! Evenimentul e gala AmCham, 200 invitați.', DATEADD(day, -15, GETUTCDATE()), DATEADD(day, -14, GETUTCDATE()), DATEADD(day, -14, GETUTCDATE())),
(17, 28, 4, 'Am 22 ani, sunt studentă la ASE. Îmi doresc să câștig experiență în marketing.', 'Bine ai venit în echipă! Campania e pentru Coca-Cola la Untold.', DATEADD(day, -10, GETUTCDATE()), DATEADD(day, -10, GETUTCDATE()), DATEADD(day, -10, GETUTCDATE())),
(18, 20, 4, 'Am lucrat ca figurant în 15 producții anul trecut, inclusiv serialul Umbre.', 'Genial CV! Te chemăm pentru scena de petrecere din noul film.', DATEADD(day, -12, GETUTCDATE()), DATEADD(day, -12, GETUTCDATE()), DATEADD(day, -12, GETUTCDATE())),
(19, 17, 4, 'Hostess cu experiență la evenimente corporate. Vorbesc engleză și franceză fluent.', 'Perfect pentru evenimentul nostru internațional! Gala Ambasadelor.', DATEADD(day, -30, GETUTCDATE()), DATEADD(day, -28, GETUTCDATE()), DATEADD(day, -28, GETUTCDATE()));

-- In Progress bookings
INSERT INTO Bookings (ClientId, ServiceId, Status, Message, EntrepreneurResponse, CreatedAt, StartDate) VALUES
(12, 4, 3, 'Sunt disponibil pentru tura de seară, am mai lucrat aici anul trecut și știu meniul.', 'Bine te regăsim! Începem la 17:00, intrarea personalului din spate.', DATEADD(day, -5, GETUTCDATE()), DATEADD(day, -1, GETUTCDATE())),
(13, 22, 3, 'Am experiență ca figurant. 1.65m, brunetă, 28 ani. Pot primi instrucțiuni rapid.', 'Ești selectată pentru scena de restaurant. Filmare în desfășurare la Buftea.', DATEADD(day, -4, GETUTCDATE()), DATEADD(day, -2, GETUTCDATE())),
(19, 15, 3, 'Disponibilă pentru poziția de hostess la expoziție. Am badge de la editia trecută.', 'Perfect! Te repartizăm la pavilionul C, zona auto.', DATEADD(day, -3, GETUTCDATE()), DATEADD(day, -1, GETUTCDATE()));

-- Accepted bookings (upcoming)
INSERT INTO Bookings (ClientId, ServiceId, Status, Message, EntrepreneurResponse, CreatedAt, StartDate) VALUES
(14, 21, 1, 'Am lucrat la filmări de reclame Vodafone și Orange. Disponibil săptămâna viitoare.', 'Super portofoliu! Te contactăm pentru casting rapid mâine.', DATEADD(day, -2, GETUTCDATE()), DATEADD(day, 3, GETUTCDATE())),
(15, 12, 1, 'Experiență ca barista la 5 to go. Pot prepara latte art și diverse metode.', 'Excelent! Evenimentul e conferința IT din Marriott.', DATEADD(day, -1, GETUTCDATE()), DATEADD(day, 2, GETUTCDATE())),
(18, 18, 1, 'Am participat ca figurant la 3 concerte anul trecut. Știu să dansez în crowd.', 'Perfect pentru videoclipul Carlas Dreams! Filmare weekend.', DATEADD(day, -1, GETUTCDATE()), DATEADD(day, 5, GETUTCDATE()));

-- Pending bookings
INSERT INTO Bookings (ClientId, ServiceId, Status, Message, CreatedAt) VALUES
(12, 23, 0, 'Am 1.82m, similar cu actorul principal. Am mai fost stand-in la MediaPro acum 2 ani.', GETUTCDATE()),
(16, 11, 0, 'Sunt disponibil pentru ajutor bucătărie. Am certificat HACCP și experiență la catering.', DATEADD(hour, -12, GETUTCDATE())),
(17, 27, 0, 'Student comunicare, îmi place să interacționez cu oamenii. Prima experiență sampling.', DATEADD(hour, -6, GETUTCDATE())),
(19, 26, 0, 'Am experiență ca demonstrator la Samsung și Apple. Cunosc produsele tech foarte bine.', DATEADD(hour, -3, GETUTCDATE()));

GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- REVIEWS
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO Reviews (ServiceId, ClientId, Rating, Comment, IsApproved, ApprovedAt, CreatedAt) VALUES
(1, 12, 5, 'Echipă super prietenoasă! M-au instruit bine la început și colegii m-au ajutat. Plata la timp. Recomand!', 1, DATEADD(day, -42, GETUTCDATE()), DATEADD(day, -43, GETUTCDATE())),
(10, 12, 5, 'Organizare impecabilă la eveniment. Transport asigurat și masă inclusă. Voi mai lucra cu ei!', 1, DATEADD(day, -37, GETUTCDATE()), DATEADD(day, -38, GETUTCDATE())),
(14, 13, 4, 'Experiență bună la târg. Training clar, dar programul s-a prelungit cu 2 ore fără bonus.', 1, DATEADD(day, -33, GETUTCDATE()), DATEADD(day, -34, GETUTCDATE())),
(19, 14, 5, 'Prima mea experiență la film și a fost grozavă! Echipa de producție foarte profesionistă.', 1, DATEADD(day, -25, GETUTCDATE()), DATEADD(day, -28, GETUTCDATE())),
(25, 15, 4, 'Job ok pentru început. Training scurt dar suficient. Plata a venit în 3 zile.', 1, DATEADD(day, -23, GETUTCDATE()), DATEADD(day, -24, GETUTCDATE())),
(2, 16, 5, 'Atmosferă incredibilă la Hard Rock! Bacșiș generos de la clienți plus bonusuri de la firmă.', 1, DATEADD(day, -18, GETUTCDATE()), DATEADD(day, -19, GETUTCDATE())),
(7, 16, 5, 'Cel mai profesionist eveniment la care am lucrat. Uniformă de calitate, briefing detaliat.', 1, DATEADD(day, -13, GETUTCDATE()), DATEADD(day, -14, GETUTCDATE())),
(28, 17, 4, 'Super experiență la festival! Obositor dar fun. Tricou și sampling gratuit ca bonus.', 1, DATEADD(day, -9, GETUTCDATE()), DATEADD(day, -10, GETUTCDATE())),
(20, 18, 5, 'Filmările sunt obositoare dar plătite corect. Catering excelent și pauze regulate.', 1, DATEADD(day, -11, GETUTCDATE()), DATEADD(day, -12, GETUTCDATE())),
(17, 19, 5, 'Eveniment de clasă! Am primit și tips de la organizatori pentru profesionalism. 100% recomand!', 1, DATEADD(day, -27, GETUTCDATE()), DATEADD(day, -28, GETUTCDATE()));

-- Pending reviews
INSERT INTO Reviews (ServiceId, ClientId, Rating, Comment, IsApproved, CreatedAt) VALUES
(4, 12, 5, 'City Grill e locul perfect să înveți meserie! Colegii te ajută și managerii sunt corecți.', 0, DATEADD(hour, -5, GETUTCDATE())),
(22, 13, 4, 'Filmare interesantă dar mult timp de așteptare între scene. Totuși, plata e ok.', 0, DATEADD(hour, -2, GETUTCDATE()));

GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- OFFERS
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO Offers (Title, Description, Type, MilestoneCount, EarlyCompletionDays, DiscountPercentage, BonusValue, RewardDescription, ValidFrom, ValidUntil, IsActive, CreatedAt, EntrepreneurProfileId) VALUES
('Bonus Weekend Warrior', 'Lucrezi 4 weekenduri consecutive? Primești bonus de 200 RON!', 0, 4, NULL, NULL, 200.00, 'Bonus cash 200 RON', DATEADD(day, -30, GETUTCDATE()), DATEADD(day, 30, GETUTCDATE()), 1, DATEADD(day, -30, GETUTCDATE()), 1),
('Referral Bonus HRC', 'Adu un prieten care lucrează minim 3 ture și primești 100 RON!', 4, NULL, NULL, NULL, 100.00, '100 RON pentru fiecare referral valid', DATEADD(day, -60, GETUTCDATE()), DATEADD(day, 120, GETUTCDATE()), 1, DATEADD(day, -60, GETUTCDATE()), 1),
('Prima Tură Dublă', 'La prima tură, dacă rămâi și pentru seară, primești +50% la plată!', 1, NULL, NULL, 50.00, 80.00, '50% extra pentru tură dublă', DATEADD(day, -15, GETUTCDATE()), DATEADD(day, 45, GETUTCDATE()), 1, DATEADD(day, -15, GETUTCDATE()), 2),
('Fidelitate City Grill', 'După 10 ture completate, primești voucher 150 RON în restaurantele noastre!', 0, 10, NULL, NULL, 150.00, 'Voucher consum 150 RON', DATEADD(day, -20, GETUTCDATE()), DATEADD(day, 60, GETUTCDATE()), 1, DATEADD(day, -20, GETUTCDATE()), 2),
('Excellence Bonus', 'Rating 5 stele de la 3 clienți consecutivi = 150 RON bonus!', 0, 3, NULL, NULL, 150.00, 'Bonus excelență 150 RON', DATEADD(day, -10, GETUTCDATE()), DATEADD(day, 50, GETUTCDATE()), 1, DATEADD(day, -10, GETUTCDATE()), 3),
('Last Minute Hero', 'Accepți un job cu mai puțin de 24h înainte? +30% la plată!', 1, NULL, 1, 30.00, NULL, '30% bonus last minute', DATEADD(day, -5, GETUTCDATE()), DATEADD(day, 55, GETUTCDATE()), 1, DATEADD(day, -5, GETUTCDATE()), 4),
('Sezon Nunți Bonus', 'Lucrezi la 5 nunți în sezon? Bonus de 300 RON!', 0, 5, NULL, NULL, 300.00, 'Bonus sezon nunți', DATEADD(day, -45, GETUTCDATE()), DATEADD(day, 90, GETUTCDATE()), 1, DATEADD(day, -45, GETUTCDATE()), 4),
('Expo Veteran', 'Ai lucrat la 3 expoziții mari? Primești prioritate și +20 RON/zi!', 5, 3, NULL, NULL, 20.00, 'Bonus zilnic +20 RON', DATEADD(day, -25, GETUTCDATE()), DATEADD(day, 35, GETUTCDATE()), 1, DATEADD(day, -25, GETUTCDATE()), 5),
('Night Shift Premium', 'Evenimente după ora 22:00 = tarif +40%!', 3, NULL, NULL, 40.00, NULL, '40% extra pentru night shift', DATEADD(day, -7, GETUTCDATE()), DATEADD(day, 53, GETUTCDATE()), 1, DATEADD(day, -7, GETUTCDATE()), 6),
('Figurant Fidel', 'Participi la 10 zile de filmare? Bonus de 500 RON + prioritate casting!', 0, 10, NULL, NULL, 500.00, 'Bonus fidelitate + prioritate', DATEADD(day, -30, GETUTCDATE()), DATEADD(day, 60, GETUTCDATE()), 1, DATEADD(day, -30, GETUTCDATE()), 7),
('Early Bird Casting', 'Confirmi participarea cu 48h înainte = garantat în producție!', 1, NULL, 2, NULL, NULL, 'Loc garantat în producție', DATEADD(day, -20, GETUTCDATE()), DATEADD(day, 40, GETUTCDATE()), 1, DATEADD(day, -20, GETUTCDATE()), 7),
('Videoclip Star', 'Apari în prim-plan într-un videoclip? Bonus 200 RON!', 2, NULL, NULL, NULL, 200.00, 'Bonus featured extra', DATEADD(day, -15, GETUTCDATE()), DATEADD(day, 45, GETUTCDATE()), 1, DATEADD(day, -15, GETUTCDATE()), 8),
('Top Promoter', 'Cele mai multe sample-uri distribuite în echipă? +100 RON bonus!', 0, 1, NULL, NULL, 100.00, 'Bonus performanță', DATEADD(day, -8, GETUTCDATE()), DATEADD(day, 22, GETUTCDATE()), 1, DATEADD(day, -8, GETUTCDATE()), 9),
('Campanie Completă', 'Participi la toată durata campaniei (7 zile)? Bonus final 200 RON!', 0, 7, NULL, NULL, 200.00, 'Bonus finalizare campanie', DATEADD(day, -12, GETUTCDATE()), DATEADD(day, 48, GETUTCDATE()), 1, DATEADD(day, -12, GETUTCDATE()), 9),
('Festival Warrior', 'Lucrezi toate cele 3 zile de festival? +50% la ultima zi!', 0, 3, NULL, 50.00, NULL, '50% extra ziua 3', DATEADD(day, -40, GETUTCDATE()), DATEADD(day, 50, GETUTCDATE()), 1, DATEADD(day, -40, GETUTCDATE()), 10),
('Adu Echipa', 'Vii cu 2 prieteni pentru aceeași campanie? 150 RON bonus pentru fiecare!', 4, NULL, NULL, NULL, 150.00, 'Bonus team referral', DATEADD(day, -25, GETUTCDATE()), DATEADD(day, 65, GETUTCDATE()), 1, DATEADD(day, -25, GETUTCDATE()), 10);

GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- CHALLENGES
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO Challenges (Title, Description, Type, Status, TargetCount, TimeLimitDays, XpReward, BadgeCode, RewardDescription, BonusValue, StartDate, EndDate, MaxParticipants, TrackingMode, ProofInstructions, CoinsReward, CreatedAt, EntrepreneurProfileId) VALUES
('HRC Rockstar', 'Completează 5 ture la Hard Rock Cafe și devino Rockstar oficial!', 0, 1, 5, 60, 250, 'HRC_ROCKSTAR', 'Tricou Hard Rock + 200 RON bonus', 200.00, DATEADD(day, -30, GETUTCDATE()), DATEADD(day, 60, GETUTCDATE()), 50, 1, NULL, 100, DATEADD(day, -35, GETUTCDATE()), 1),
('Review Champion HRC', 'Lasă 3 review-uri pozitive despre experiența ta la HRC!', 1, 1, 3, 45, 100, 'HRC_REVIEWER', 'Badge Top Reviewer + 50 RON', 50.00, DATEADD(day, -20, GETUTCDATE()), DATEADD(day, 40, GETUTCDATE()), 100, 2, NULL, 50, DATEADD(day, -25, GETUTCDATE()), 1),
('City Grill Pro', 'Lucrează 10 ture la City Grill în 90 de zile!', 0, 1, 10, 90, 400, 'CITYGRILL_PRO', 'Card VIP City Grill + 300 RON', 300.00, DATEADD(day, -45, GETUTCDATE()), DATEADD(day, 45, GETUTCDATE()), 30, 1, NULL, 150, DATEADD(day, -50, GETUTCDATE()), 2),
('Hospitality Star', 'Completează 8 job-uri la Grand Hotel Continental.', 0, 1, 8, 120, 350, 'HOTEL_STAR', 'O noapte gratuită la hotel + 250 RON', 250.00, DATEADD(day, -60, GETUTCDATE()), DATEADD(day, 60, GETUTCDATE()), NULL, 1, NULL, 120, DATEADD(day, -65, GETUTCDATE()), 3),
('Wedding Season Champion', 'Participă la 7 nunți în acest sezon de vară!', 5, 1, 7, 90, 300, 'WEDDING_CHAMP', 'Bonus 400 RON + prioritate evenimente premium', 400.00, DATEADD(day, -40, GETUTCDATE()), DATEADD(day, 50, GETUTCDATE()), 40, 1, NULL, 100, DATEADD(day, -45, GETUTCDATE()), 4),
('Last Minute Hero', 'Acceptă și completează 3 job-uri last-minute (sub 24h notice)!', 2, 1, 3, 60, 200, 'LAST_MIN_HERO', 'Badge + prioritate la job-uri urgente', NULL, DATEADD(day, -15, GETUTCDATE()), DATEADD(day, 45, GETUTCDATE()), NULL, 4, 'Încarcă screenshot cu confirmarea booking-ului arătând data și ora acceptării', 80, DATEADD(day, -20, GETUTCDATE()), 4),
('Expo Expert', 'Lucrează la 5 expoziții diferite la Romexpo!', 3, 1, 5, 180, 250, 'EXPO_EXPERT', 'Card acces VIP + 200 RON', 200.00, DATEADD(day, -50, GETUTCDATE()), DATEADD(day, 130, GETUTCDATE()), 50, 1, NULL, 100, DATEADD(day, -55, GETUTCDATE()), 5),
('Event Master', 'Participă la 6 evenimente corporate de nivel înalt!', 0, 1, 6, 120, 350, 'EVENT_MASTER', 'Recomandare pentru agenții partenere + 300 RON', 300.00, DATEADD(day, -30, GETUTCDATE()), DATEADD(day, 90, GETUTCDATE()), 25, 1, NULL, 130, DATEADD(day, -35, GETUTCDATE()), 6),
('Figurant Star', 'Participă la 15 zile de filmare în producții Castel Film!', 3, 1, 15, 180, 500, 'FILM_STAR', 'Acces la casting-uri pentru roluri vorbite + 500 RON', 500.00, DATEADD(day, -60, GETUTCDATE()), DATEADD(day, 120, GETUTCDATE()), 100, 1, NULL, 200, DATEADD(day, -65, GETUTCDATE()), 7),
('Set Photo Challenge', 'Fă o poză în costume pe platou și share-uiește experiența!', 1, 1, 1, 30, 50, 'SET_MEMORY', 'Photo print + 30 RON', 30.00, DATEADD(day, -10, GETUTCDATE()), DATEADD(day, 20, GETUTCDATE()), NULL, 4, 'Încarcă o poză de pe platou în costum (fără spoilere despre producție!)', 20, DATEADD(day, -15, GETUTCDATE()), 7),
('Reclame Collector', 'Apari în 5 reclame TV diferite!', 0, 1, 5, 120, 300, 'AD_COLLECTOR', 'Demo reel profesional + 300 RON', 300.00, DATEADD(day, -45, GETUTCDATE()), DATEADD(day, 75, GETUTCDATE()), 60, 1, NULL, 120, DATEADD(day, -50, GETUTCDATE()), 8),
('Promo All-Star', 'Completează 8 campanii de promovare pentru McCann!', 0, 1, 8, 90, 350, 'PROMO_STAR', 'Poziție permanentă part-time + 350 RON bonus', 350.00, DATEADD(day, -40, GETUTCDATE()), DATEADD(day, 50, GETUTCDATE()), 30, 1, NULL, 140, DATEADD(day, -45, GETUTCDATE()), 9),
('Festival Season', 'Lucrează la 4 festivaluri în această vară!', 5, 1, 4, 120, 250, 'FESTIVAL_VET', 'Acces VIP festival + 250 RON', 250.00, DATEADD(day, -50, GETUTCDATE()), DATEADD(day, 70, GETUTCDATE()), NULL, 1, NULL, 100, DATEADD(day, -55, GETUTCDATE()), 10),
('Street Team Leader', 'Coordonează o echipă de 5 persoane la un eveniment!', 0, 1, 1, 60, 200, 'TEAM_LEADER', 'Poziție de team leader permanent + 200 RON', 200.00, DATEADD(day, -20, GETUTCDATE()), DATEADD(day, 40, GETUTCDATE()), 20, 4, 'Încarcă confirmarea de la coordonator că ai fost team leader', 80, DATEADD(day, -25, GETUTCDATE()), 10);

GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- CHALLENGE PARTICIPATIONS
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO ChallengeParticipations (ChallengeId, UserId, CurrentProgress, Status, CreatedAt, CompletedAt, RewardAwarded, XpAwarded) VALUES
(1, 12, 3, 3, DATEADD(day, -25, GETUTCDATE()), NULL, 0, 0),
(3, 12, 7, 3, DATEADD(day, -40, GETUTCDATE()), NULL, 0, 0),
(9, 13, 8, 3, DATEADD(day, -50, GETUTCDATE()), NULL, 0, 0),
(10, 13, 1, 4, DATEADD(day, -8, GETUTCDATE()), DATEADD(day, -6, GETUTCDATE()), 1, 50),
(11, 14, 3, 3, DATEADD(day, -30, GETUTCDATE()), NULL, 0, 0),
(4, 16, 5, 3, DATEADD(day, -45, GETUTCDATE()), NULL, 0, 0),
(2, 16, 2, 3, DATEADD(day, -15, GETUTCDATE()), NULL, 0, 0),
(12, 15, 4, 3, DATEADD(day, -35, GETUTCDATE()), NULL, 0, 0),
(7, 19, 3, 3, DATEADD(day, -40, GETUTCDATE()), NULL, 0, 0),
(8, 19, 4, 3, DATEADD(day, -25, GETUTCDATE()), NULL, 0, 0);

GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- MESSAGES
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO Messages (ServiceId, SenderId, RecipientId, Content, SentAt, IsRead) VALUES
(1, 12, 2, 'Bună! Am văzut că aveți nevoie de ospătari weekendul acesta. Sunt disponibil sâmbătă și duminică. Am mai lucrat în HoReCa.', DATEADD(day, -6, GETUTCDATE()), 1),
(1, 2, 12, 'Salut Ion! Super, avem nevoie urgentă. Ai experiență cu POS-uri și cu comenzi complexe? Sâmbăta e concert live, va fi aglomerat.', DATEADD(day, -6, GETUTCDATE()), 1),
(1, 12, 2, 'Da, am lucrat cu diverse sisteme POS la Marriott. Știu să gestionez comenzi mari și muncă sub presiune.', DATEADD(day, -5, GETUTCDATE()), 1),
(1, 2, 12, 'Perfect! Te așteptăm sâmbătă la 10:00 pentru briefing. Adu CI și cont IBAN pentru plată. Uniformă primești de la noi.', DATEADD(day, -5, GETUTCDATE()), 1),
(1, 12, 2, 'Înțeles! O întrebare - cât durează de obicei tura sâmbăta cu concert?', DATEADD(day, -5, GETUTCDATE()), 1),
(1, 2, 12, 'În mod normal 8 ore, dar la concerte poate fi 10-11 ore. Orele extra sunt plătite cu 50% bonus.', DATEADD(day, -5, GETUTCDATE()), 0);

INSERT INTO Messages (ServiceId, SenderId, RecipientId, Content, SentAt, IsRead) VALUES
(19, 13, 8, 'Bună! Sunt interesată de poziția de figurant. Am 28 ani, 1.65m, brunetă. Ce producții aveți în lucru?', DATEADD(day, -5, GETUTCDATE()), 1),
(19, 8, 13, 'Salut Maria! Filmăm acum un serial TV și un film internațional. Pentru serialul TV căutăm figuranți pentru scene de restaurant. Te-ar interesa?', DATEADD(day, -5, GETUTCDATE()), 1),
(19, 13, 8, 'Da, absolut! Când ar fi filmările?', DATEADD(day, -4, GETUTCDATE()), 1),
(19, 8, 13, 'Marți și miercuri săptămâna viitoare. Pickup din București ora 6:00, filmare la Buftea. Masă și transport incluse. 200 RON/zi.', DATEADD(day, -4, GETUTCDATE()), 1),
(19, 13, 8, 'Super! Confirm pentru ambele zile. Trebuie să aduc ceva anume?', DATEADD(day, -4, GETUTCDATE()), 0);

INSERT INTO Messages (ServiceId, SenderId, RecipientId, Content, SentAt, IsRead) VALUES
(7, 16, 4, 'Bună ziua! Am văzut anunțul pentru ospătar banchet. Am experiență la evenimente formale, am lucrat la gale și conferințe.', DATEADD(day, -4, GETUTCDATE()), 1),
(7, 4, 16, 'Bună Andrei! Excelent background. Avem o gală vineri pentru 200 de persoane. Cunoști servirea la farfurie în stil francez?', DATEADD(day, -4, GETUTCDATE()), 1),
(7, 16, 4, 'Da, am făcut training pentru servire formală. Știu și wine service basics.', DATEADD(day, -3, GETUTCDATE()), 1),
(7, 4, 16, 'Perfect! Te programăm pentru vineri. Start ora 16:00 pentru setup, eveniment 19:00-24:00. Ținută neagră elegantă, vesta și papion le primești de la noi.', DATEADD(day, -3, GETUTCDATE()), 1),
(7, 16, 4, 'Mulțumesc! Confirm prezența. O să fiu acolo la 16:00.', DATEADD(day, -3, GETUTCDATE()), 0);

INSERT INTO Messages (ServiceId, SenderId, RecipientId, Content, SentAt, IsRead) VALUES
(17, 19, 7, 'Bună! Sunt interesată de poziția de hostess pentru evenimente corporate. Vorbesc engleză și franceză fluent.', DATEADD(day, -2, GETUTCDATE()), 1),
(17, 7, 19, 'Bună Diana! Wow, exact ce căutăm! Avem un eveniment internațional săptămâna viitoare - ambasade și corporații. Ai experiență similară?', DATEADD(day, -2, GETUTCDATE()), 1),
(17, 19, 7, 'Da! Am fost hostess la conferința IT Summit și la câteva lansări de produse. Am și experiență ca translator.', DATEADD(day, -2, GETUTCDATE()), 1),
(17, 7, 19, 'Excelent! Te vrem pentru Gala Ambasadelor de joi. Poți face și interpretariat rapid dacă e nevoie? Plata e 250 RON pentru seară.', DATEADD(day, -2, GETUTCDATE()), 0);

GO

PRINT 'Demo data seeded successfully!';
PRINT '================================';
PRINT 'App Purpose: Temporary One-Day Jobs Platform';
PRINT 'Universal Password: Demo123!';
PRINT '';
PRINT 'Admin: admin@bizquits.ro';
PRINT '';
PRINT 'Entrepreneurs (Companies posting temporary jobs):';
PRINT '  HORECA:';
PRINT '    - hr@hardrockcafe.ro (Hard Rock Cafe București)';
PRINT '    - jobs@citygrillbucharest.ro (City Grill)';
PRINT '    - angajari@grandhotelcontinental.ro (Grand Hotel Continental)';
PRINT '    - contact@cateringexpert.ro (Catering Expert)';
PRINT '  Events:';
PRINT '    - staff@romexpo.ro (Romexpo SA)';
PRINT '    - hr@evenimentebucuresti.ro (Evenimente București)';
PRINT '  Figuration/Casting:';
PRINT '    - casting@castelfilm.ro (Castel Film Studios)';
PRINT '    - figuranti@mediapro.ro (MediaPro Pictures)';
PRINT '  Promotions:';
PRINT '    - promotii@mccann.ro (McCann România)';
PRINT '    - sampling@streetpromo.ro (Street Promo Agency)';
PRINT '';
PRINT 'Workers (People looking for temporary jobs):';
PRINT '  - ion.popescu@gmail.com (Level 6, experienced - 25 jobs)';
PRINT '  - maria.ionescu@yahoo.com (Level 4, reliable - 15 jobs)';
PRINT '  - alexandru.popa@outlook.com (Level 3 - 8 jobs)';
PRINT '  - elena.dumitrescu@gmail.com (Level 2, newer - 4 jobs)';
PRINT '  - andrei.stan@icloud.com (Level 5, active - 20 jobs)';
PRINT '  - cristina.marin@gmail.com (Level 1, just started - 2 jobs)';
PRINT '  - bogdan.vasile@yahoo.com (Level 4 - 12 jobs)';
PRINT '  - diana.radu@gmail.com (Level 5, frequent - 18 jobs)';
GO
