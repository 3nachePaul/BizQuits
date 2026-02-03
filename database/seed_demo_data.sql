-- BizQuits Demo Data for Presentation
-- =====================================
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

-- Entrepreneur Users (Real Romanian Companies)
INSERT INTO Users (Email, PasswordHash, Role) VALUES
('contact@emag.ro', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 1),
('servicii@dedeman.ro', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 1),
('support@altex.ro', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 1),
('office@autonom.ro', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 1),
('contact@freshful.ro', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 1),
('hello@tazz.ro', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 1),
('office@regina-maria.ro', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 1),
('contact@worldclass.ro', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 1),
('servicii@bitdefender.ro', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 1),
('contact@uipath.ro', '$2a$12$oQ8Lu9v.xzCw5hy.dGpB8.o2aBttrGgcwB5n..xoheIIhUrOqPYrO', 1);

-- Client Users
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
(2, 'eMAG', 'RO14399840', 1),
(3, 'Dedeman', 'RO4192717', 1),
(4, 'Altex Romania', 'RO6779023', 1),
(5, 'Autonom Rent a Car', 'RO14520250', 1),
(6, 'Freshful by eMAG', 'RO41890760', 1),
(7, 'Tazz by eMAG', 'RO40958013', 1),
(8, 'Regina Maria', 'RO15575940', 1),
(9, 'World Class Romania', 'RO16441025', 1),
(10, 'Bitdefender', 'RO18189442', 1),
(11, 'UiPath', 'RO33358606', 1);

GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- SERVICES
-- ═══════════════════════════════════════════════════════════════════════════════

-- eMAG Services (EntrepreneurProfileId = 1)
INSERT INTO Services (Name, Description, Category, Duration, Price, IsActive, CreatedAt, EntrepreneurProfileId) VALUES
('Instalare Electrocasnice', 'Serviciu profesional de instalare pentru mașini de spălat, frigidere, cuptoare și alte electrocasnice mari. Include conectare la utilități și testare completă.', 'Instalari', '2-3 ore', 149.00, 1, DATEADD(day, -60, GETUTCDATE()), 1),
('Montaj TV pe Perete', 'Montaj profesional pentru televizoare de orice dimensiune. Include ascunderea cablurilor și configurarea inițială.', 'Instalari', '1-2 ore', 99.00, 1, DATEADD(day, -55, GETUTCDATE()), 1),
('Configurare Smart Home', 'Setup complet pentru dispozitive smart home: becuri inteligente, prize smart, asistenți vocali. Include integrare în ecosistem.', 'Tehnologie', '2-4 ore', 249.00, 1, DATEADD(day, -45, GETUTCDATE()), 1);

-- Dedeman Services (EntrepreneurProfileId = 2)
INSERT INTO Services (Name, Description, Category, Duration, Price, IsActive, CreatedAt, EntrepreneurProfileId) VALUES
('Montaj Mobilier', 'Asamblare și montaj profesional pentru orice tip de mobilier: dulapuri, paturi, birouri, bucătării modulare.', 'Montaj', '3-6 ore', 199.00, 1, DATEADD(day, -50, GETUTCDATE()), 2),
('Instalare Gresie și Faianță', 'Serviciu complet de montaj pentru gresie și faianță în băi și bucătării. Include pregătirea suprafeței și rostuire.', 'Constructii', '1-3 zile', 45.00, 1, DATEADD(day, -48, GETUTCDATE()), 2),
('Montaj Uși și Ferestre', 'Instalare profesională pentru uși interioare, exterioare și ferestre termopan. Include etanșare și finisare.', 'Constructii', '4-8 ore', 299.00, 1, DATEADD(day, -40, GETUTCDATE()), 2),
('Consultanță Renovare', 'Sesiune de consultanță pentru proiecte de renovare. Include măsurători, recomandări materiale și estimare buget.', 'Consultanta', '1-2 ore', 0.00, 1, DATEADD(day, -35, GETUTCDATE()), 2);

-- Altex Services (EntrepreneurProfileId = 3)
INSERT INTO Services (Name, Description, Category, Duration, Price, IsActive, CreatedAt, EntrepreneurProfileId) VALUES
('Reparații Laptop', 'Diagnosticare și reparare laptopuri: înlocuire componente, curățare termică, reinstalare sistem de operare.', 'Reparatii', '1-3 zile', 149.00, 1, DATEADD(day, -42, GETUTCDATE()), 3),
('Transfer Date', 'Migrare completă de date între dispozitive: documente, fotografii, contacte, aplicații. Include backup în cloud.', 'Tehnologie', '2-4 ore', 79.00, 1, DATEADD(day, -38, GETUTCDATE()), 3),
('Configurare PC Gaming', 'Setup complet pentru sisteme gaming: instalare componente, optimizare BIOS, instalare drivere și software dedicat.', 'Tehnologie', '3-5 ore', 199.00, 1, DATEADD(day, -30, GETUTCDATE()), 3);

-- Autonom Services (EntrepreneurProfileId = 4)
INSERT INTO Services (Name, Description, Category, Duration, Price, IsActive, CreatedAt, EntrepreneurProfileId) VALUES
('Închiriere Auto Weekend', 'Pachet weekend pentru închiriere auto: Vineri ora 14:00 - Luni ora 10:00. Include asigurare completă și km nelimitați.', 'Transport', '3 zile', 189.00, 1, DATEADD(day, -45, GETUTCDATE()), 4),
('Transfer Aeroport', 'Serviciu de transfer de la/către aeroporturile din București, Cluj, Timișoara. Șofer profesionist și mașină premium.', 'Transport', '1-2 ore', 149.00, 1, DATEADD(day, -40, GETUTCDATE()), 4),
('Închiriere cu Șofer', 'Serviciu de închiriere auto cu șofer dedicat pentru evenimente, întâlniri de afaceri sau tururi private.', 'Transport', 'Per zi', 399.00, 1, DATEADD(day, -32, GETUTCDATE()), 4);

-- Freshful Services (EntrepreneurProfileId = 5)
INSERT INTO Services (Name, Description, Category, Duration, Price, IsActive, CreatedAt, EntrepreneurProfileId) VALUES
('Coș Săptămânal Premium', 'Abonament săptămânal cu fructe și legume proaspete de sezon, produse lactate și pâine artizanală. Livrare gratuită.', 'Abonamente', 'Săptămânal', 249.00, 1, DATEADD(day, -50, GETUTCDATE()), 5),
('Catering Eveniment', 'Serviciu catering pentru evenimente: cocktail party, prânz de lucru, aniversări. Meniu personalizat și servire inclusă.', 'Evenimente', 'Per persoană', 89.00, 1, DATEADD(day, -35, GETUTCDATE()), 5),
('Livrare Express', 'Livrare în 60 de minute pentru cumpărături urgente. Disponibil în București și zonele limitrofe.', 'Livrare', '1 ora', 19.90, 1, DATEADD(day, -28, GETUTCDATE()), 5);

-- Tazz Services (EntrepreneurProfileId = 6)
INSERT INTO Services (Name, Description, Category, Duration, Price, IsActive, CreatedAt, EntrepreneurProfileId) VALUES
('Abonament Tazz Plus', 'Livrare gratuită nelimitată de la toate restaurantele partenere. Include acces la oferte exclusive și priority delivery.', 'Abonamente', 'Lunar', 29.99, 1, DATEADD(day, -55, GETUTCDATE()), 6),
('Corporate Meal Plan', 'Program de masă pentru companii: prânz zilnic pentru echipe. Include diverse opțiuni și livrare la birou.', 'Corporate', 'Per angajat/zi', 45.00, 1, DATEADD(day, -40, GETUTCDATE()), 6),
('Catering Party Box', 'Pachete party pentru 10-50 persoane: pizza, burgeri, sushi sau mix. Perfect pentru petreceri și team building.', 'Evenimente', 'Per pachet', 299.00, 1, DATEADD(day, -25, GETUTCDATE()), 6);

-- Regina Maria Services (EntrepreneurProfileId = 7)
INSERT INTO Services (Name, Description, Category, Duration, Price, IsActive, CreatedAt, EntrepreneurProfileId) VALUES
('Consultație Medicina Generală', 'Consultație completă cu medic specialist în medicină internă. Include recomandări și rețetă dacă este necesar.', 'Sanatate', '30 minute', 180.00, 1, DATEADD(day, -60, GETUTCDATE()), 7),
('Pachet Analize Complete', 'Set complet de analize de sânge: hemoleucogramă, biochimie, markeri hepatici și renali. Include recoltare și interpretare.', 'Sanatate', '1 zi rezultate', 450.00, 1, DATEADD(day, -50, GETUTCDATE()), 7),
('Abonament Medical Corporativ', 'Pachet medical anual pentru angajați: consultații nelimitate, analize, imagistică de bază și telemedicină 24/7.', 'Corporate', 'Anual', 1200.00, 1, DATEADD(day, -45, GETUTCDATE()), 7),
('Vaccinare la Domiciliu', 'Serviciu de vaccinare la domiciliu sau sediul firmei. Include consultație pre-vaccinare și monitorizare post-vaccinare.', 'Sanatate', '30 minute', 99.00, 1, DATEADD(day, -30, GETUTCDATE()), 7);

-- World Class Services (EntrepreneurProfileId = 8)
INSERT INTO Services (Name, Description, Category, Duration, Price, IsActive, CreatedAt, EntrepreneurProfileId) VALUES
('Abonament Premium All Access', 'Acces nelimitat la toate cluburile World Class, inclusiv piscină, saună și clase de grup. Include evaluare fizică gratuită.', 'Fitness', 'Lunar', 399.00, 1, DATEADD(day, -55, GETUTCDATE()), 8),
('Personal Training 10 Sesiuni', 'Pachet de 10 sesiuni cu antrenor personal certificat. Include plan nutrițional personalizat și monitorizare progres.', 'Fitness', '10 x 1 oră', 1499.00, 1, DATEADD(day, -45, GETUTCDATE()), 8),
('Yoga & Mindfulness Retreat', 'Weekend retreat în natură: sesiuni de yoga, meditație și wellness. Include cazare, mese sănătoase și transport.', 'Wellness', '2 zile', 799.00, 1, DATEADD(day, -35, GETUTCDATE()), 8);

-- Bitdefender Services (EntrepreneurProfileId = 9)
INSERT INTO Services (Name, Description, Category, Duration, Price, IsActive, CreatedAt, EntrepreneurProfileId) VALUES
('Bitdefender Total Security', 'Protecție completă pentru 5 dispozitive: antivirus, anti-malware, firewall, VPN inclus și control parental.', 'Securitate', 'Anual', 249.00, 1, DATEADD(day, -50, GETUTCDATE()), 9),
('Audit Securitate Companie', 'Evaluare completă a securității IT pentru IMM-uri: vulnerabilități, riscuri, recomandări și plan de acțiune.', 'Corporate', '2-3 zile', 2999.00, 1, DATEADD(day, -40, GETUTCDATE()), 9),
('Training Cybersecurity', 'Workshop interactiv pentru angajați: recunoașterea amenințărilor, phishing, bune practici și protocol de răspuns.', 'Training', '4 ore', 499.00, 1, DATEADD(day, -30, GETUTCDATE()), 9);

-- UiPath Services (EntrepreneurProfileId = 10)
INSERT INTO Services (Name, Description, Category, Duration, Price, IsActive, CreatedAt, EntrepreneurProfileId) VALUES
('RPA Discovery Workshop', 'Workshop de identificare a proceselor automatizabile în companie. Include analiză ROI și prioritizare procese.', 'Automatizare', '1 zi', 1999.00, 1, DATEADD(day, -45, GETUTCDATE()), 10),
('Implementare Robot Simplu', 'Dezvoltare și implementare robot RPA pentru un proces de business: facturare, raportare sau data entry.', 'Automatizare', '2-4 săptămâni', 4999.00, 1, DATEADD(day, -35, GETUTCDATE()), 10),
('Training UiPath Developer', 'Curs intensiv de 5 zile pentru dezvoltatori: UiPath Studio, Orchestrator, best practices și certificare.', 'Training', '5 zile', 2499.00, 1, DATEADD(day, -25, GETUTCDATE()), 10);

GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- CLIENT STATS (for gamification)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO ClientStats (UserId, Xp, Level, TotalBookingsCreated, TotalBookingsCompleted, UpdatedAt) VALUES
(12, 850, 5, 12, 10, DATEADD(day, -1, GETUTCDATE())),  -- Ion Popescu - power user
(13, 420, 3, 6, 5, DATEADD(day, -3, GETUTCDATE())),   -- Maria Ionescu
(14, 280, 2, 4, 3, DATEADD(day, -5, GETUTCDATE())),   -- Alexandru Popa
(15, 150, 1, 2, 2, DATEADD(day, -7, GETUTCDATE())),   -- Elena Dumitrescu
(16, 550, 4, 8, 7, DATEADD(day, -2, GETUTCDATE())),   -- Andrei Stan
(17, 95, 1, 1, 1, DATEADD(day, -10, GETUTCDATE())),   -- Cristina Marin - new user
(18, 320, 2, 5, 4, DATEADD(day, -4, GETUTCDATE())),   -- Bogdan Vasile
(19, 680, 4, 9, 8, DATEADD(day, -1, GETUTCDATE()));   -- Diana Radu

GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- BOOKINGS (Status: 0=Pending, 1=Accepted, 2=Rejected, 3=InProgress, 4=Completed, 5=Cancelled)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Completed bookings (for reviews and history)
INSERT INTO Bookings (ClientId, ServiceId, Status, Message, EntrepreneurResponse, CreatedAt, StartDate, CompletedDate) VALUES
(12, 1, 4, 'Am cumpărat o mașină de spălat nouă și am nevoie de instalare profesională.', 'Perfect, ne programăm pentru data solicitată. Vă rugăm să aveți prize și apă la îndemână.', DATEADD(day, -45, GETUTCDATE()), DATEADD(day, -43, GETUTCDATE()), DATEADD(day, -43, GETUTCDATE())),
(12, 4, 4, 'Doresc montajul unui dulap PAX de la IKEA.', 'Cu plăcere! Menționați dimensiunile complete când ne vedem.', DATEADD(day, -40, GETUTCDATE()), DATEADD(day, -38, GETUTCDATE()), DATEADD(day, -38, GETUTCDATE())),
(13, 22, 4, 'Vreau să încerc abonamentul premium pentru o lună.', 'Bine ați venit în familia World Class! Vă așteptăm pentru evaluarea inițială.', DATEADD(day, -35, GETUTCDATE()), DATEADD(day, -34, GETUTCDATE()), DATEADD(day, -4, GETUTCDATE())),
(14, 8, 4, 'Laptop Dell care se supraîncălzește constant.', 'Am identificat problema - pasta termică era veche. Am curățat și înlocuit totul.', DATEADD(day, -30, GETUTCDATE()), DATEADD(day, -28, GETUTCDATE()), DATEADD(day, -26, GETUTCDATE())),
(15, 19, 4, 'Consultație pentru dureri de cap frecvente.', 'Vă mulțumim pentru vizită. Urmați tratamentul recomandat și reveniți pentru control.', DATEADD(day, -25, GETUTCDATE()), DATEADD(day, -24, GETUTCDATE()), DATEADD(day, -24, GETUTCDATE())),
(16, 2, 4, 'TV Samsung 65 inch, perete din rigips.', 'Montaj realizat cu succes. Am folosit dibluri speciale pentru rigips.', DATEADD(day, -20, GETUTCDATE()), DATEADD(day, -19, GETUTCDATE()), DATEADD(day, -19, GETUTCDATE())),
(16, 11, 4, 'Transfer aeroport Otopeni pentru 4 persoane.', 'Am confirmat rezervarea. Șoferul va fi la ieșirea din terminal.', DATEADD(day, -15, GETUTCDATE()), DATEADD(day, -14, GETUTCDATE()), DATEADD(day, -14, GETUTCDATE())),
(17, 14, 4, 'Prima comandă, vreau să testez serviciul.', 'Sperăm că v-a plăcut! Așteptăm feedback-ul dumneavoastră.', DATEADD(day, -10, GETUTCDATE()), DATEADD(day, -10, GETUTCDATE()), DATEADD(day, -10, GETUTCDATE())),
(18, 24, 4, 'Interesat de soluția Bitdefender pentru familie.', 'Licența a fost activată. Verificați email-ul pentru instrucțiuni de instalare.', DATEADD(day, -12, GETUTCDATE()), DATEADD(day, -12, GETUTCDATE()), DATEADD(day, -12, GETUTCDATE())),
(19, 23, 4, 'Sesiuni personal training pentru pregătire maraton.', 'Felicitări pentru angajament! Planul tău personalizat este gata.', DATEADD(day, -30, GETUTCDATE()), DATEADD(day, -28, GETUTCDATE()), DATEADD(day, -3, GETUTCDATE()));

-- In Progress bookings
INSERT INTO Bookings (ClientId, ServiceId, Status, Message, EntrepreneurResponse, CreatedAt, StartDate) VALUES
(12, 3, 3, 'Vreau să-mi automatizez casa: lumini, termostat, jaluzele.', 'Am planificat vizita pentru evaluare. Pregătiți lista completă de dispozitive dorite.', DATEADD(day, -5, GETUTCDATE()), DATEADD(day, -3, GETUTCDATE())),
(13, 5, 3, 'Renovare baie completă, aproximativ 8mp.', 'Am început lucrările. Estimăm finalizare în 3 zile.', DATEADD(day, -4, GETUTCDATE()), DATEADD(day, -2, GETUTCDATE())),
(19, 27, 3, 'Workshop pentru echipa noastră de 15 persoane.', 'Am confirmat data. Vă trimitem agenda detaliată.', DATEADD(day, -3, GETUTCDATE()), DATEADD(day, -1, GETUTCDATE()));

-- Accepted bookings (upcoming)
INSERT INTO Bookings (ClientId, ServiceId, Status, Message, EntrepreneurResponse, CreatedAt, StartDate) VALUES
(14, 6, 1, 'Schimbare ferestre la apartament, 5 bucăți.', 'Acceptat! Vă contactăm pentru măsurători exacte.', DATEADD(day, -2, GETUTCDATE()), DATEADD(day, 3, GETUTCDATE())),
(15, 21, 1, 'Pachet analize pentru control anual.', 'Programare confirmată. Veniți à jeun dimineața.', DATEADD(day, -1, GETUTCDATE()), DATEADD(day, 2, GETUTCDATE())),
(18, 28, 1, 'Interesat de automatizare pentru departamentul HR.', 'Excelent! Organizăm workshop-ul de discovery.', DATEADD(day, -1, GETUTCDATE()), DATEADD(day, 5, GETUTCDATE()));

-- Pending bookings (awaiting response)
INSERT INTO Bookings (ClientId, ServiceId, Status, Message, CreatedAt) VALUES
(12, 10, 0, 'PC gaming nou, vreau să mă asigur că totul e setat corect pentru performanță maximă.', GETUTCDATE()),
(16, 15, 0, 'Organizăm petrecere de firmă pentru 30 persoane. Avem nevoie de catering diversificat.', DATEADD(hour, -12, GETUTCDATE())),
(17, 7, 0, 'Avem nevoie de consultanță pentru renovarea completă a apartamentului.', DATEADD(hour, -6, GETUTCDATE())),
(19, 26, 0, 'Audit de securitate pentru startup-ul nostru tech.', DATEADD(hour, -3, GETUTCDATE()));

GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- REVIEWS (for completed bookings)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO Reviews (ServiceId, ClientId, Rating, Comment, IsApproved, ApprovedAt, CreatedAt) VALUES
(1, 12, 5, 'Instalare impecabilă! Echipa a venit la timp, a lucrat curat și a explicat totul despre utilizarea mașinii. Super recomand!', 1, DATEADD(day, -42, GETUTCDATE()), DATEADD(day, -43, GETUTCDATE())),
(4, 12, 4, 'Montaj bun în general, dar au întârziat puțin. Dulapul arată perfect acum.', 1, DATEADD(day, -37, GETUTCDATE()), DATEADD(day, -38, GETUTCDATE())),
(22, 13, 5, 'Cea mai bună decizie! Facilitățile sunt extraordinare și personalul foarte amabil. Merită fiecare ban.', 1, DATEADD(day, -3, GETUTCDATE()), DATEADD(day, -4, GETUTCDATE())),
(8, 14, 5, 'Mi-au salvat laptopul! Acum funcționează ca nou. Preț corect pentru munca depusă.', 1, DATEADD(day, -25, GETUTCDATE()), DATEADD(day, -26, GETUTCDATE())),
(19, 15, 4, 'Medic foarte atent și profesionist. Singura problemă a fost timpul de așteptare cam lung.', 1, DATEADD(day, -23, GETUTCDATE()), DATEADD(day, -24, GETUTCDATE())),
(2, 16, 5, 'Montaj perfect pentru TV-ul meu! Cablurile sunt ascunse frumos, totul arată foarte curat pe perete.', 1, DATEADD(day, -18, GETUTCDATE()), DATEADD(day, -19, GETUTCDATE())),
(11, 16, 5, 'Șofer punctual și foarte politicos. Mașina curată și confortabilă. Exact ce aveam nevoie după un zbor lung.', 1, DATEADD(day, -13, GETUTCDATE()), DATEADD(day, -14, GETUTCDATE())),
(14, 17, 4, 'Livrare rapidă și produse proaspete. Voi recomanda cu siguranță!', 1, DATEADD(day, -9, GETUTCDATE()), DATEADD(day, -10, GETUTCDATE())),
(24, 18, 5, 'Protecție excelentă și ușor de instalat. VPN-ul inclus e un bonus mare!', 1, DATEADD(day, -11, GETUTCDATE()), DATEADD(day, -12, GETUTCDATE())),
(23, 19, 5, 'Antrenorul meu este fantastic! Am văzut rezultate vizibile în doar 3 săptămâni. Planul nutrițional a făcut diferența.', 1, DATEADD(day, -2, GETUTCDATE()), DATEADD(day, -3, GETUTCDATE()));

-- Pending reviews (for admin moderation demo)
INSERT INTO Reviews (ServiceId, ClientId, Rating, Comment, IsApproved, CreatedAt) VALUES
(3, 12, 5, 'Casa mea smart funcționează perfect acum! Pot controla totul de pe telefon. Implementare profesionistă.', 0, DATEADD(hour, -5, GETUTCDATE())),
(5, 13, 4, 'Lucrare în progres, dar până acum totul arată excelent. Echipa foarte organizată.', 0, DATEADD(hour, -2, GETUTCDATE()));

GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- OFFERS
-- ═══════════════════════════════════════════════════════════════════════════════
-- OfferType: 0=JobMilestone, 1=EarlyCompletion, 2=Coupon, 3=Discount, 4=Referral, 5=LoyaltyReward

INSERT INTO Offers (Title, Description, Type, MilestoneCount, EarlyCompletionDays, DiscountPercentage, BonusValue, RewardDescription, ValidFrom, ValidUntil, IsActive, CreatedAt, EntrepreneurProfileId) VALUES
-- eMAG
('Prima Instalare Gratuită', 'La achiziția oricărui electrocasnic mare, prima instalare este inclusă gratuit!', 3, NULL, NULL, 100.00, 149.00, 'Instalare gratuită (valoare 149 RON)', DATEADD(day, -30, GETUTCDATE()), DATEADD(day, 30, GETUTCDATE()), 1, DATEADD(day, -30, GETUTCDATE()), 1),
('Client Fidel eMAG', 'După 5 servicii de instalare, primești unul gratuit!', 0, 5, NULL, NULL, 149.00, 'Al 6-lea serviciu de instalare gratuit', DATEADD(day, -60, GETUTCDATE()), DATEADD(day, 120, GETUTCDATE()), 1, DATEADD(day, -60, GETUTCDATE()), 1),

-- Dedeman
('Reducere 20% Montaj', 'Discount 20% la orice serviciu de montaj pentru clienții cu card Dedeman Club.', 3, NULL, NULL, 20.00, NULL, '20% reducere la montaj', DATEADD(day, -15, GETUTCDATE()), DATEADD(day, 45, GETUTCDATE()), 1, DATEADD(day, -15, GETUTCDATE()), 2),
('Consultanță GRATUITĂ', 'Consultanță renovare gratuită la orice proiect de peste 5000 RON materiale cumpărate.', 2, NULL, NULL, NULL, 0.00, 'Consultanță gratuită', DATEADD(day, -20, GETUTCDATE()), DATEADD(day, 60, GETUTCDATE()), 1, DATEADD(day, -20, GETUTCDATE()), 2),

-- Altex
('Back to School -15%', 'Reducere 15% la configurare și transfer date pentru studenți!', 3, NULL, NULL, 15.00, NULL, '15% discount cu legitimație student', DATEADD(day, -10, GETUTCDATE()), DATEADD(day, 20, GETUTCDATE()), 1, DATEADD(day, -10, GETUTCDATE()), 3),

-- Autonom
('Weekend Getaway', 'Închiriere weekend la preț de 2 zile! Ofertă limitată.', 3, NULL, NULL, 33.33, 63.00, 'Economisești o zi de închiriere', DATEADD(day, -5, GETUTCDATE()), DATEADD(day, 25, GETUTCDATE()), 1, DATEADD(day, -5, GETUTCDATE()), 4),
('Referral Bonus', 'Recomandă un prieten și ambii primiți 50 RON credit!', 4, NULL, NULL, NULL, 50.00, '50 RON credit pentru fiecare referral', DATEADD(day, -45, GETUTCDATE()), DATEADD(day, 90, GETUTCDATE()), 1, DATEADD(day, -45, GETUTCDATE()), 4),

-- Freshful
('Prima Livrare Gratuită', 'Livrare express gratuită la prima comandă peste 100 RON!', 2, NULL, NULL, NULL, 19.90, 'Livrare gratuită', DATEADD(day, -25, GETUTCDATE()), DATEADD(day, 35, GETUTCDATE()), 1, DATEADD(day, -25, GETUTCDATE()), 5),

-- Tazz
('Tazz Plus 50% OFF', 'Prima lună de abonament Tazz Plus la jumătate de preț!', 3, NULL, NULL, 50.00, 15.00, 'Economisești 15 RON prima lună', DATEADD(day, -7, GETUTCDATE()), DATEADD(day, 23, GETUTCDATE()), 1, DATEADD(day, -7, GETUTCDATE()), 6),

-- Regina Maria
('Pachet Family Health', 'Reducere 25% la pachetul de analize când aduci toată familia (min. 3 persoane).', 3, NULL, NULL, 25.00, NULL, '25% reducere per persoană', DATEADD(day, -20, GETUTCDATE()), DATEADD(day, 40, GETUTCDATE()), 1, DATEADD(day, -20, GETUTCDATE()), 7),
('Bonus Vaccinare', 'Vaccin antigripal gratuit pentru clienții cu abonament corporativ!', 5, NULL, NULL, NULL, 99.00, 'Vaccin antigripal gratuit', DATEADD(day, -30, GETUTCDATE()), DATEADD(day, 60, GETUTCDATE()), 1, DATEADD(day, -30, GETUTCDATE()), 7),

-- World Class
('New Year Resolution', 'Înscrie-te în ianuarie și primești 2 luni la preț de 1!', 0, 1, NULL, NULL, 399.00, 'O lună gratuită de abonament', DATEADD(day, -35, GETUTCDATE()), DATEADD(day, 25, GETUTCDATE()), 1, DATEADD(day, -35, GETUTCDATE()), 8),
('Bring a Friend', 'Adu un prieten la antrenament și primești o sesiune PT gratuită!', 4, NULL, NULL, NULL, 150.00, 'Sesiune personal training gratuită', DATEADD(day, -15, GETUTCDATE()), DATEADD(day, 45, GETUTCDATE()), 1, DATEADD(day, -15, GETUTCDATE()), 8),

-- Bitdefender
('Cyber Monday Special', 'Bitdefender Total Security cu 40% reducere! Protejează-ți familia.', 3, NULL, NULL, 40.00, 100.00, 'Economisești 100 RON', DATEADD(day, -8, GETUTCDATE()), DATEADD(day, 7, GETUTCDATE()), 1, DATEADD(day, -8, GETUTCDATE()), 9),

-- UiPath
('Starter Pack Automation', 'Workshop de discovery gratuit pentru companiile care implementează primul robot RPA!', 2, NULL, NULL, NULL, 1999.00, 'Workshop gratuit (valoare 1999 RON)', DATEADD(day, -40, GETUTCDATE()), DATEADD(day, 50, GETUTCDATE()), 1, DATEADD(day, -40, GETUTCDATE()), 10),
('Early Bird Training', 'Înscriere cu 30 de zile înainte = 20% reducere la cursul de developer!', 1, NULL, 30, 20.00, 500.00, 'Economisești 500 RON', DATEADD(day, -25, GETUTCDATE()), DATEADD(day, 65, GETUTCDATE()), 1, DATEADD(day, -25, GETUTCDATE()), 10);

GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- CHALLENGES
-- ═══════════════════════════════════════════════════════════════════════════════
-- ChallengeType: 0=BookingMilestone, 1=ReviewChallenge, 2=SpeedChallenge, 3=LoyaltyChallenge, 4=ReferralChallenge, 5=SeasonalChallenge
-- ChallengeStatus: 0=Draft, 1=Active, 2=Completed, 3=Cancelled

INSERT INTO Challenges (Title, Description, Type, Status, TargetCount, TimeLimitDays, XpReward, BadgeCode, RewardDescription, BonusValue, StartDate, EndDate, MaxParticipants, CreatedAt, EntrepreneurProfileId) VALUES
-- eMAG
('Smart Home Champion', 'Configurează-ți casa inteligentă completă! Finalizează 3 servicii de instalare smart home.', 0, 1, 3, 90, 200, 'SMART_PIONEER', 'Voucher 100 RON pentru accesorii smart', 100.00, DATEADD(day, -30, GETUTCDATE()), DATEADD(day, 60, GETUTCDATE()), 50, DATEADD(day, -35, GETUTCDATE()), 1),
('Review Hero eMAG', 'Lasă 5 recenzii detaliate pentru serviciile noastre și ajută comunitatea!', 1, 1, 5, 60, 150, 'TOP_REVIEWER', 'Badge Top Reviewer + 50 RON voucher', 50.00, DATEADD(day, -20, GETUTCDATE()), DATEADD(day, 40, GETUTCDATE()), 100, DATEADD(day, -25, GETUTCDATE()), 1),

-- Dedeman
('Renovator Pro', 'Completează 5 proiecte de renovare cu Dedeman și devino Renovator Pro!', 0, 1, 5, 180, 300, 'RENOVATOR_PRO', 'Card VIP Dedeman + 200 RON credit', 200.00, DATEADD(day, -45, GETUTCDATE()), DATEADD(day, 135, GETUTCDATE()), 30, DATEADD(day, -50, GETUTCDATE()), 2),

-- Autonom
('Road Tripper', 'Închiriază mașini pentru 10 zile în total și deblochează avantaje exclusive!', 3, 1, 10, 365, 250, 'ROAD_TRIPPER', 'Upgrade gratuit la categoria superioară', 189.00, DATEADD(day, -60, GETUTCDATE()), DATEADD(day, 305, GETUTCDATE()), NULL, DATEADD(day, -65, GETUTCDATE()), 4),
('Speed Booker', 'Rezervă în mai puțin de 24h de la căutare și primești bonus!', 2, 1, 1, NULL, 75, 'SPEED_DEMON', '10% extra discount la rezervare', NULL, DATEADD(day, -15, GETUTCDATE()), DATEADD(day, 45, GETUTCDATE()), NULL, DATEADD(day, -20, GETUTCDATE()), 4),

-- Freshful
('Healthy Week', 'Comandă coșul săptămânal timp de 4 săptămâni consecutive!', 3, 1, 4, 28, 100, 'HEALTHY_HABIT', 'Livrare gratuită pe termen nelimitat pentru luna următoare', 79.60, DATEADD(day, -10, GETUTCDATE()), DATEADD(day, 50, GETUTCDATE()), 200, DATEADD(day, -15, GETUTCDATE()), 5),

-- Tazz
('Foodie Explorer', 'Comandă de la 10 restaurante diferite și descoperă noi gusturi!', 0, 1, 10, 30, 120, 'FOODIE_EXPLORER', 'Voucher 75 RON pentru orice restaurant', 75.00, DATEADD(day, -5, GETUTCDATE()), DATEADD(day, 25, GETUTCDATE()), NULL, DATEADD(day, -10, GETUTCDATE()), 6),

-- Regina Maria
('Health First', 'Completează check-up-ul anual complet: consultație + analize + vaccin.', 0, 1, 3, 90, 175, 'HEALTH_CHAMPION', '15% reducere la următorul pachet medical', NULL, DATEADD(day, -40, GETUTCDATE()), DATEADD(day, 50, GETUTCDATE()), NULL, DATEADD(day, -45, GETUTCDATE()), 7),

-- World Class
('Fitness Warrior', 'Participă la 20 de clase de grup într-o lună!', 0, 1, 20, 30, 200, 'FITNESS_WARRIOR', 'Sesiune spa gratuită + smoothie bar credit', 150.00, DATEADD(day, -8, GETUTCDATE()), DATEADD(day, 22, GETUTCDATE()), 100, DATEADD(day, -12, GETUTCDATE()), 8),
('New Member Journey', 'Finalizează programul de inițiere: evaluare + 3 sesiuni PT + 5 clase grup.', 3, 1, 9, 45, 350, 'WORLD_CLASS_MEMBER', 'O lună gratuită de abonament', 399.00, DATEADD(day, -30, GETUTCDATE()), DATEADD(day, 60, GETUTCDATE()), 50, DATEADD(day, -35, GETUTCDATE()), 8),

-- Bitdefender
('Cyber Guardian', 'Protejează 3 dispozitive și completează security assessment-ul personal.', 0, 1, 3, 60, 100, 'CYBER_GUARDIAN', 'VPN Premium 6 luni gratuit', 89.00, DATEADD(day, -25, GETUTCDATE()), DATEADD(day, 35, GETUTCDATE()), NULL, DATEADD(day, -30, GETUTCDATE()), 9),

-- UiPath
('Automation Pioneer', 'Participă la workshop și implementează primul tău robot RPA!', 0, 1, 2, 90, 500, 'RPA_PIONEER', 'Certificare UiPath gratuită + 1 an suport premium', 999.00, DATEADD(day, -50, GETUTCDATE()), DATEADD(day, 40, GETUTCDATE()), 20, DATEADD(day, -55, GETUTCDATE()), 10);

GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- CHALLENGE PARTICIPATIONS (for active gamification demo)
-- Status: 0=Pending, 1=Accepted, 2=Rejected, 3=InProgress, 4=Completed, 5=Failed, 6=Withdrawn
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO ChallengeParticipations (ChallengeId, UserId, CurrentProgress, Status, CreatedAt, CompletedAt, RewardAwarded, XpAwarded) VALUES
-- Ion Popescu - active challenger
(1, 12, 2, 3, DATEADD(day, -25, GETUTCDATE()), NULL, 0, 0),  -- Smart Home Champion: 2/3 done
(2, 12, 4, 3, DATEADD(day, -18, GETUTCDATE()), NULL, 0, 0),  -- Review Hero: 4/5 done
-- Maria Ionescu
(9, 13, 12, 3, DATEADD(day, -6, GETUTCDATE()), NULL, 0, 0),  -- Fitness Warrior: 12/20 classes
-- Andrei Stan  
(4, 16, 5, 3, DATEADD(day, -40, GETUTCDATE()), NULL, 0, 0),  -- Road Tripper: 5/10 days
(5, 16, 1, 4, DATEADD(day, -10, GETUTCDATE()), DATEADD(day, -10, GETUTCDATE()), 1, 75), -- Speed Booker: completed
-- Diana Radu
(10, 19, 7, 3, DATEADD(day, -25, GETUTCDATE()), NULL, 0, 0), -- New Member Journey: 7/9 done
(7, 19, 8, 3, DATEADD(day, -4, GETUTCDATE()), NULL, 0, 0),   -- Foodie Explorer: 8/10 restaurants
-- Alexandru Popa
(11, 14, 2, 3, DATEADD(day, -20, GETUTCDATE()), NULL, 0, 0), -- Cyber Guardian: 2/3 devices
-- Elena Dumitrescu
(8, 15, 2, 3, DATEADD(day, -35, GETUTCDATE()), NULL, 0, 0);  -- Health First: 2/3 steps done

GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- MESSAGES (for chat demo)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Message conversations between clients and entrepreneurs

-- Conversation: Ion Popescu <-> eMAG about Smart Home
INSERT INTO Messages (ServiceId, SenderId, RecipientId, Content, SentAt, IsRead) VALUES
(3, 12, 2, 'Bună ziua! Am văzut că oferiți servicii de configurare smart home. Aș dori să automatizez întreaga casă - lumini, termostat, jaluzele. Cam care ar fi costul total?', DATEADD(day, -6, GETUTCDATE()), 1),
(3, 2, 12, 'Bună ziua! Mulțumim pentru interes. Pentru o configurare completă avem nevoie de câteva detalii: câte camere, ce dispozitive aveți deja, și ce ecosistem preferați (Google, Alexa, Apple)?', DATEADD(day, -6, GETUTCDATE()), 1),
(3, 12, 2, 'Am 4 camere + living. Nu am nimic smart momentan. Prefer Google pentru că am deja un telefon Android și un Chromecast.', DATEADD(day, -5, GETUTCDATE()), 1),
(3, 2, 12, 'Perfect! Pentru configurarea ta recomand: 15 becuri Philips Hue, 1 termostat Nest, 3 prize smart, 1 Google Home Hub. Total estimat: ~2500 RON produse + 249 RON instalare. Putem programa o vizită de evaluare gratuită?', DATEADD(day, -5, GETUTCDATE()), 1),
(3, 12, 2, 'Sună bine! Da, haideți să programăm vizita. Sunt disponibil weekendul acesta.', DATEADD(day, -5, GETUTCDATE()), 1),
(3, 2, 12, 'Excelent! Te-am programat pentru sâmbătă între 10:00-12:00. Colegul nostru Mihai te va contacta pentru confirmare. Îți mulțumim!', DATEADD(day, -5, GETUTCDATE()), 0);

-- Conversation: Maria Ionescu <-> Dedeman about renovation
INSERT INTO Messages (ServiceId, SenderId, RecipientId, Content, SentAt, IsRead) VALUES
(5, 13, 3, 'Bună! Am nevoie de faianță nouă în baie. Suprafața e de 8mp. Puteți să-mi spuneți cam cât durează și ce preț ar fi?', DATEADD(day, -5, GETUTCDATE()), 1),
(5, 3, 13, 'Salut! Pentru 8mp de faianță, durata e de 2-3 zile. Prețul include: pregătire suprafață + montaj + rostuire. Costul e 45 RON/mp, deci aproximativ 360 RON manoperă. Materialele le achiziționați separat.', DATEADD(day, -5, GETUTCDATE()), 1),
(5, 13, 3, 'Mulțumesc! Aș vrea să vin să aleg faianța săptămâna asta. Puteți să îmi recomandați ceva potrivit pentru o baie modernă?', DATEADD(day, -4, GETUTCDATE()), 1),
(5, 3, 13, 'Sigur! Îți recomand colecția Nordic Marble - foarte populară anul acesta, rezistentă și ușor de întreținut. E în stoc la magazinul din Militari. Când veniți, cereți un consultant și vă ajută cu calculul exact.', DATEADD(day, -4, GETUTCDATE()), 1),
(5, 13, 3, 'Super, mulțumesc mult! Vin mâine dimineață.', DATEADD(day, -4, GETUTCDATE()), 0);

-- Conversation: Diana Radu <-> World Class about personal training
INSERT INTO Messages (ServiceId, SenderId, RecipientId, Content, SentAt, IsRead) VALUES
(23, 19, 9, 'Bună! Am terminat cele 10 sesiuni de personal training și vreau să continui. Pot să cumpăr un nou pachet?', DATEADD(day, -4, GETUTCDATE()), 1),
(23, 9, 19, 'Felicitări pentru perseverență, Diana! 🎉 Da, poți achiziționa un nou pachet. Ai progres excelent - antrenorul Radu mi-a arătat fișa ta. Vrei să continui cu el sau să încerci și alți antrenori?', DATEADD(day, -4, GETUTCDATE()), 1),
(23, 19, 9, 'Vreau să continui cu Radu, mă înțeleg foarte bine cu el. Și pregătirea pentru maraton merge bine datorită lui!', DATEADD(day, -3, GETUTCDATE()), 1),
(23, 9, 19, 'Perfect! Ai și challenge-ul "New Member Journey" aproape complet - mai ai nevoie de 2 clase de grup. După ce îl finalizezi, primești O LUNĂ GRATUITĂ! 💪', DATEADD(day, -3, GETUTCDATE()), 1),
(23, 19, 9, 'Wow, nu știam! Mă duc la yoga diseară și pilates mâine. Mulțumesc pentru reminder!', DATEADD(day, -3, GETUTCDATE()), 0);

-- Conversation: Bogdan Vasile <-> Bitdefender
INSERT INTO Messages (ServiceId, SenderId, RecipientId, Content, SentAt, IsRead) VALUES
(24, 18, 10, 'Bună! Am instalat Bitdefender pe laptop dar nu reușesc să activez VPN-ul. Îmi puteți ajuta?', DATEADD(day, -2, GETUTCDATE()), 1),
(24, 10, 18, 'Bună ziua! Pentru activarea VPN: deschideți aplicația Bitdefender -> Privacy -> VPN -> Connect. Dacă cereți locație specifică, selectați din listă. Funcționează?', DATEADD(day, -2, GETUTCDATE()), 1),
(24, 18, 10, 'Merge acum! Mulțumesc. Încă o întrebare - pot folosi aceeași licență și pe telefonul soției?', DATEADD(day, -2, GETUTCDATE()), 1),
(24, 10, 18, 'Da, licența Total Security acoperă 5 dispozitive. Descărcați aplicația Bitdefender Mobile Security pe telefon și folosiți aceleași credențiale. Totul e sincronizat în contul Bitdefender Central.', DATEADD(day, -2, GETUTCDATE()), 0);

GO

PRINT 'Demo data seeded successfully!';
PRINT '================================';
PRINT 'Universal Password: Demo123!';
PRINT '';
PRINT 'Admin: admin@bizquits.ro';
PRINT '';
PRINT 'Entrepreneurs (10 companies):';
PRINT '  - contact@emag.ro (eMAG)';
PRINT '  - servicii@dedeman.ro (Dedeman)';
PRINT '  - support@altex.ro (Altex)';
PRINT '  - office@autonom.ro (Autonom)';
PRINT '  - contact@freshful.ro (Freshful)';
PRINT '  - hello@tazz.ro (Tazz)';
PRINT '  - office@regina-maria.ro (Regina Maria)';
PRINT '  - contact@worldclass.ro (World Class)';
PRINT '  - servicii@bitdefender.ro (Bitdefender)';
PRINT '  - contact@uipath.ro (UiPath)';
PRINT '';
PRINT 'Clients (8 users):';
PRINT '  - ion.popescu@gmail.com (Level 5, power user)';
PRINT '  - maria.ionescu@yahoo.com (Level 3)';
PRINT '  - alexandru.popa@outlook.com (Level 2)';
PRINT '  - elena.dumitrescu@gmail.com (Level 1)';
PRINT '  - andrei.stan@icloud.com (Level 4)';
PRINT '  - cristina.marin@gmail.com (Level 1, new)';
PRINT '  - bogdan.vasile@yahoo.com (Level 2)';
PRINT '  - diana.radu@gmail.com (Level 4)';
GO
