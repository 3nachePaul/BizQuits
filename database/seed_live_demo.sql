-- ═══════════════════════════════════════════════════════════════════════════════
-- BizQuits LIVE DEMO Data - Client Perspective
-- ═══════════════════════════════════════════════════════════════════════════════
-- Purpose: Demonstrate gamification features from a NEW CLIENT perspective
-- Demo User: demo.client@gmail.com / Demo123!
-- ═══════════════════════════════════════════════════════════════════════════════

USE BizQuits;
GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 1: CLEANUP PREVIOUS DEMO DATA (if exists)
-- ═══════════════════════════════════════════════════════════════════════════════
DELETE FROM Messages WHERE SenderId IN (SELECT Id FROM Users WHERE Email LIKE 'demo.%@gmail.com');
DELETE FROM Messages WHERE RecipientId IN (SELECT Id FROM Users WHERE Email LIKE 'demo.%@gmail.com');
DELETE FROM Reviews WHERE ClientId IN (SELECT Id FROM Users WHERE Email LIKE 'demo.%@gmail.com');
DELETE FROM ChallengeParticipations WHERE UserId IN (SELECT Id FROM Users WHERE Email LIKE 'demo.%@gmail.com');
DELETE FROM OfferClaims WHERE UserId IN (SELECT Id FROM Users WHERE Email LIKE 'demo.%@gmail.com');
DELETE FROM Bookings WHERE ClientId IN (SELECT Id FROM Users WHERE Email LIKE 'demo.%@gmail.com');
DELETE FROM ClientStats WHERE UserId IN (SELECT Id FROM Users WHERE Email LIKE 'demo.%@gmail.com');
DELETE FROM UserAchievements WHERE UserId IN (SELECT Id FROM Users WHERE Email LIKE 'demo.%@gmail.com');
DELETE FROM Users WHERE Email LIKE 'demo.%@gmail.com';
GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 2: SPECIAL CHALLENGES FOR LIVE DEMO
-- (Easy to demonstrate, quick to complete, attractive rewards)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Delete previous demo challenges
DELETE FROM ChallengeParticipations WHERE ChallengeId IN (
    SELECT Id FROM Challenges WHERE Title LIKE '%DEMO%' OR Title LIKE '%Welcome%' OR Title LIKE '%Quick Start%'
);
DELETE FROM Challenges WHERE Title LIKE '%DEMO%' OR Title LIKE '%Welcome%' OR Title LIKE '%Quick Start%';
GO

-- Insert special demo-friendly challenges
INSERT INTO Challenges (
    Title, Description, Type, Status, TargetCount, TimeLimitDays, 
    XpReward, BadgeCode, RewardDescription, BonusValue, 
    StartDate, EndDate, MaxParticipants, TrackingMode, 
    ProofInstructions, CoinsReward, CreatedAt, EntrepreneurProfileId
) VALUES
-- Challenge 1: Welcome Challenge (Hard Rock Cafe) - Easy first win!
(
    '🎸 Welcome Rockstar', 
    'Bine ai venit în comunitatea BizQuits! Completează primul tău job la Hard Rock Cafe și devino parte din familie. Perfect pentru începători - echipa noastră te va ghida pas cu pas!', 
    0, -- BookingMilestone
    1, -- Active
    1, -- Only 1 booking needed!
    30, -- 30 days limit
    100, -- XP Reward
    'WELCOME_ROCKSTAR', 
    '🎁 Tricou Hard Rock Cafe + Masă gratuită + 50 RON bonus', 
    50.00,
    DATEADD(day, -5, GETUTCDATE()), 
    DATEADD(day, 30, GETUTCDATE()), 
    100, -- Max participants
    0, -- Automatic tracking
    NULL, 
    50, -- Coins reward
    DATEADD(day, -5, GETUTCDATE()), 
    1 -- Hard Rock Cafe
),

-- Challenge 2: Quick Explorer (City Grill) - Try different things
(
    '🍽️ City Explorer', 
    'Explorează oportunitățile din restaurantele City Grill! Aplică la 2 job-uri diferite și descoperă care ți se potrivește mai bine. Fiecare experiență te ajută să crești!', 
    0, -- BookingMilestone
    1, -- Active
    2, -- 2 bookings needed
    45, -- 45 days
    150, -- XP Reward
    'CITY_EXPLORER', 
    '🏆 Voucher 100 RON City Grill + Badge Explorer', 
    100.00,
    DATEADD(day, -3, GETUTCDATE()), 
    DATEADD(day, 45, GETUTCDATE()), 
    50,
    0, -- Automatic
    NULL, 
    75, 
    DATEADD(day, -3, GETUTCDATE()), 
    2 -- City Grill
),

-- Challenge 3: Review Star (Multi-entrepreneur) - Encourage engagement
(
    '⭐ Review Champion', 
    'Vocea ta contează! Lasă 2 review-uri sincere despre experiențele tale de muncă. Ajuți comunitatea să găsească cele mai bune oportunități!', 
    1, -- ReviewChallenge
    1, -- Active
    2, -- 2 reviews needed
    30, -- 30 days
    120, -- XP Reward
    'REVIEW_CHAMP', 
    '📝 Badge Top Reviewer + 75 RON bonus', 
    75.00,
    DATEADD(day, -2, GETUTCDATE()), 
    DATEADD(day, 30, GETUTCDATE()), 
    NULL, -- Unlimited
    0, -- Automatic
    NULL, 
    60, 
    DATEADD(day, -2, GETUTCDATE()), 
    1 -- Hard Rock Cafe (sponsor)
),

-- Challenge 4: Newbie Friendly - Castel Film
(
    '🎬 Prima Ta Filmare', 
    'Visezi să apari într-un film? Acesta e momentul tău! Participă la prima ta zi de figurație la Castel Film Studios. Nu e nevoie de experiență - te învățăm tot!', 
    0, -- BookingMilestone
    1, -- Active
    1, -- 1 filming day
    60, -- 60 days
    80, -- XP Reward
    'FIRST_FILM', 
    '🎬 Poză profesională de pe set + 40 RON', 
    40.00,
    DATEADD(day, -7, GETUTCDATE()), 
    DATEADD(day, 60, GETUTCDATE()), 
    200,
    0, -- Automatic
    NULL, 
    40, 
    DATEADD(day, -7, GETUTCDATE()), 
    7 -- Castel Film
),

-- Challenge 5: Weekend Warrior - Easy weekend challenge
(
    '🌟 Weekend Warrior', 
    'Profită de weekend! Completează un job în weekend (sâmbătă sau duminică) și câștigă recompense extra. Programul flexibil îți permite să câștigi bani fără să-ți afectezi săptămâna!', 
    0, -- BookingMilestone
    1, -- Active
    1, -- 1 weekend job
    14, -- 2 weeks
    90, -- XP Reward
    'WEEKEND_WARRIOR', 
    '💪 Badge Weekend Warrior + 60 RON bonus', 
    60.00,
    DATEADD(day, -1, GETUTCDATE()), 
    DATEADD(day, 14, GETUTCDATE()), 
    NULL, -- Unlimited
    0, -- Automatic
    NULL, 
    45, 
    DATEADD(day, -1, GETUTCDATE()), 
    6 -- Evenimente București
),

-- Challenge 6: Speed Demon - Quick completion bonus
(
    '⚡ Speed Demon', 
    'Ești rapid la decizii? Acceptă un job în mai puțin de 2 ore de la postare și completează-l cu succes. Angajatorii adoră oamenii care reacționează rapid!', 
    2, -- SpeedChallenge
    1, -- Active
    1, 
    30, 
    110, -- XP Reward
    'SPEED_DEMON', 
    '⚡ Prioritate la job-uri urgente + 70 RON', 
    70.00,
    DATEADD(day, -3, GETUTCDATE()), 
    DATEADD(day, 30, GETUTCDATE()), 
    30,
    0, -- Automatic
    NULL, 
    55, 
    DATEADD(day, -3, GETUTCDATE()), 
    4 -- Catering Expert
);
GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 3: SPECIAL OFFERS FOR NEW USERS
-- (Attractive for demo, easy to understand)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Delete previous demo offers
DELETE FROM OfferClaims WHERE OfferId IN (
    SELECT Id FROM Offers WHERE Title LIKE '%Welcome%' OR Title LIKE '%Newbie%' OR Title LIKE '%First%Timer%'
);
DELETE FROM Offers WHERE Title LIKE '%Welcome%' OR Title LIKE '%Newbie%' OR Title LIKE '%First%Timer%';
GO

-- Insert demo-friendly offers
INSERT INTO Offers (
    Title, Description, Type, MilestoneCount, EarlyCompletionDays, 
    DiscountPercentage, BonusValue, CoinCost, RewardDescription, 
    ValidFrom, ValidUntil, IsActive, CreatedAt, EntrepreneurProfileId
) VALUES
-- Offer 1: Welcome Bonus - Free for new users!
(
    '🎉 Welcome Bonus - Primul Job', 
    'Bine ai venit în BizQuits! La primul tău job completat cu succes, primești un bonus de bun venit. Ofertă exclusivă pentru utilizatorii noi!', 
    0, -- JobMilestone
    1, -- First job
    NULL, 
    NULL, 
    30.00, -- 30 RON bonus
    0, -- FREE to claim!
    '30 RON bonus + Badge Welcome',
    DATEADD(day, -10, GETUTCDATE()), 
    DATEADD(day, 60, GETUTCDATE()), 
    1, 
    DATEADD(day, -10, GETUTCDATE()), 
    1 -- Hard Rock Cafe
),

-- Offer 2: Early Bird - Low coin cost
(
    '🌅 Early Bird Bonus', 
    'Confirmi participarea cu 48h înainte de job? Primești bonus de punctualitate! Angajatorii apreciază siguranța că vei fi prezent.', 
    1, -- EarlyCompletion
    NULL, 
    2, -- 48h before
    NULL, 
    25.00, 
    10, -- Only 10 coins
    '25 RON bonus pentru confirmare timpurie',
    DATEADD(day, -5, GETUTCDATE()), 
    DATEADD(day, 45, GETUTCDATE()), 
    1, 
    DATEADD(day, -5, GETUTCDATE()), 
    2 -- City Grill
),

-- Offer 3: Discount Voucher
(
    '🎟️ Voucher 15% Reducere Catering', 
    'Ai un eveniment personal (aniversare, petrecere)? Folosește acest voucher pentru 15% reducere la serviciile de catering de la Catering Expert!', 
    2, -- Coupon
    NULL, 
    NULL, 
    15.00, -- 15% discount
    NULL, 
    20, -- 20 coins
    '15% reducere la comenzi catering personal',
    DATEADD(day, -7, GETUTCDATE()), 
    DATEADD(day, 90, GETUTCDATE()), 
    1, 
    DATEADD(day, -7, GETUTCDATE()), 
    4 -- Catering Expert
),

-- Offer 4: Loyalty starter
(
    '💎 Starter Loyalty Pack', 
    'Completează 3 job-uri cu orice angajator și deblochează pachetul de fidelitate! Include acces prioritar la job-uri premium.', 
    5, -- LoyaltyReward
    3, -- 3 jobs
    NULL, 
    NULL, 
    50.00, 
    15, -- 15 coins
    'Acces prioritar + 50 RON bonus',
    DATEADD(day, -3, GETUTCDATE()), 
    DATEADD(day, 60, GETUTCDATE()), 
    1, 
    DATEADD(day, -3, GETUTCDATE()), 
    5 -- Romexpo
),

-- Offer 5: Referral for demo
(
    '👥 Bring a Friend', 
    'Invită un prieten să se alăture BizQuits! Când prietenul tău completează primul job, ambii primiți câte 40 RON!', 
    4, -- Referral
    NULL, 
    NULL, 
    NULL, 
    40.00, 
    0, -- FREE to claim
    '40 RON pentru tine + 40 RON pentru prieten',
    DATEADD(day, -15, GETUTCDATE()), 
    DATEADD(day, 90, GETUTCDATE()), 
    1, 
    DATEADD(day, -15, GETUTCDATE()), 
    10 -- Street Promo
),

-- Offer 6: Film experience bonus
(
    '🎬 Film Debut Bonus', 
    'Prima ta experiență ca figurant? Primești bonus special pentru debutul în industria de film! Perfect pentru CV-ul tău creativ.', 
    0, -- JobMilestone
    1, 
    NULL, 
    NULL, 
    35.00, 
    5, -- Only 5 coins
    '35 RON + Poză profesională de pe set',
    DATEADD(day, -8, GETUTCDATE()), 
    DATEADD(day, 45, GETUTCDATE()), 
    1, 
    DATEADD(day, -8, GETUTCDATE()), 
    7 -- Castel Film
);
GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 4: FRESH ATTRACTIVE SERVICES FOR DEMO
-- (Jobs that look appealing for demo presentation)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add some fresh, attractive services with recent dates
INSERT INTO Services (Name, Description, Category, Duration, Price, IsActive, CreatedAt, EntrepreneurProfileId) VALUES
-- Hard Rock Cafe - Fresh posting
(
    '🎸 Ospătar Concert LIVE - Această Sâmbătă!', 
    'Căutăm ospătari energici pentru concertul LIVE de sâmbătă! Experiența nu e obligatorie - oferim training complet. Atmosferă incredibilă, tips generoase de la clienți, și poți asculta muzică rock live în timp ce lucrezi! Uniformă cool furnizată.', 
    'HORECA', 
    '8-10 ore', 
    200.00, 
    1, 
    DATEADD(hour, -6, GETUTCDATE()), -- Posted 6 hours ago
    1
),

-- City Grill - Weekend opportunity
(
    '🍽️ Personal Weekend - Bonus Garantat!', 
    'Weekend aglomerat la City Grill! Avem nevoie de personal pentru ture de prânz și seară. Masă gratuită din meniu + bonus de 30 RON pentru performanță! Ideal pentru studenți sau cei care caută venit extra în weekend.', 
    'HORECA', 
    '6 ore', 
    180.00, 
    1, 
    DATEADD(hour, -12, GETUTCDATE()), 
    2
),

-- Castel Film - Exciting opportunity
(
    '🎬 Figurație Film Internațional - URGENT!', 
    'Producție Netflix caută figuranți pentru scene de petrecere în București! Nu e nevoie de experiență. Catering de lux, pauze regulate, și șansa de a vedea cum se face un film de Hollywood! Diverse vârste și aspecte căutate.', 
    'Figuration', 
    '10-12 ore', 
    280.00, 
    1, 
    DATEADD(hour, -3, GETUTCDATE()), -- Very fresh!
    7
),

-- Event - Corporate gala
(
    '✨ Hostess Gală Corporate VIP', 
    'Eveniment de gală pentru companii Fortune 500! Căutăm hostess cu aspect elegant și comunicare excelentă. Experiența în evenimente e un plus. Ținută elegantă furnizată, networking cu profesioniști de top!', 
    'Evenimente', 
    '6 ore', 
    220.00, 
    1, 
    DATEADD(hour, -8, GETUTCDATE()), 
    6
),

-- Promo - Fun opportunity
(
    '🎈 Brand Ambassador Festival', 
    'Festival de vară în București! Căutăm tineri energici pentru promovare brand-uri cool. Include: tricou gratuit, acces VIP la festival, mâncare și băuturi gratuite pe toată durata! Perfect pentru vară!', 
    'Promotii', 
    '8 ore', 
    170.00, 
    1, 
    DATEADD(hour, -4, GETUTCDATE()), 
    10
);
GO

-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION & SUMMARY
-- ═══════════════════════════════════════════════════════════════════════════════

PRINT '═══════════════════════════════════════════════════════════════════════════════';
PRINT '  🎮 BizQuits LIVE DEMO Data - Ready!';
PRINT '═══════════════════════════════════════════════════════════════════════════════';
PRINT '';
PRINT '  📋 DEMO FLOW:';
PRINT '  ─────────────────────────────────────────────────────────────────────────────';
PRINT '  1. 🆕 CREATE NEW ACCOUNT: demo.client@gmail.com / Demo123!';
PRINT '  2. 🔍 BROWSE JOBS: Show fresh job listings with attractive descriptions';
PRINT '  3. 📝 APPLY TO JOB: Apply to "Ospătar Concert LIVE" at Hard Rock Cafe';
PRINT '  4. 🎟️ FIRST ACHIEVEMENT: "First Booking" unlocks! +20 XP';
PRINT '  5. 💬 CHAT: Communicate with employer about details';
PRINT '  6. ✅ JOB COMPLETED: Employer marks booking as complete';
PRINT '  7. 🏆 ACHIEVEMENTS: "First Completed Booking" +40 XP, Level UP!';
PRINT '  8. ⭐ LEAVE REVIEW: Write first review';
PRINT '  9. ✍️ REVIEW ACHIEVEMENT: "First Review" +30 XP';
PRINT '  10. 🎯 JOIN CHALLENGE: Enroll in "Welcome Rockstar" challenge';
PRINT '  11. 🎁 CLAIM OFFER: Redeem "Welcome Bonus" offer (FREE!)';
PRINT '  12. 📊 VIEW PROFILE: Show XP bar, Level, Achievements, Coins';
PRINT '';
PRINT '  🎯 CHALLENGES CREATED FOR DEMO:';
PRINT '  ─────────────────────────────────────────────────────────────────────────────';

SELECT 
    '  • ' + Title AS Challenge,
    'Target: ' + CAST(TargetCount AS VARCHAR) AS Goal,
    CAST(XpReward AS VARCHAR) + ' XP' AS Reward,
    CAST(CoinsReward AS VARCHAR) + ' coins' AS Coins
FROM Challenges 
WHERE Title LIKE '%Welcome%' 
   OR Title LIKE '%Explorer%' 
   OR Title LIKE '%Champion%' 
   OR Title LIKE '%Prima Ta%'
   OR Title LIKE '%Weekend%'
   OR Title LIKE '%Speed%'
ORDER BY XpReward;

PRINT '';
PRINT '  🎁 OFFERS CREATED FOR DEMO:';
PRINT '  ─────────────────────────────────────────────────────────────────────────────';

SELECT 
    '  • ' + Title AS Offer,
    CASE WHEN CoinCost = 0 THEN 'FREE!' ELSE CAST(CoinCost AS VARCHAR) + ' coins' END AS Cost,
    COALESCE(CAST(BonusValue AS VARCHAR) + ' RON', 'Special Reward') AS Value
FROM Offers 
WHERE Title LIKE '%Welcome%' 
   OR Title LIKE '%Early%' 
   OR Title LIKE '%Voucher%'
   OR Title LIKE '%Starter%'
   OR Title LIKE '%Friend%'
   OR Title LIKE '%Debut%'
ORDER BY CoinCost;

PRINT '';
PRINT '  🆕 FRESH JOBS FOR DEMO:';
PRINT '  ─────────────────────────────────────────────────────────────────────────────';

SELECT TOP 5
    '  • ' + Name AS Job,
    Category,
    CAST(Price AS VARCHAR) + ' RON' AS Pay
FROM Services 
WHERE CreatedAt > DATEADD(day, -1, GETUTCDATE())
ORDER BY CreatedAt DESC;

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════════════════════';
PRINT '  ✅ Demo data ready! Start the demo by registering: demo.client@gmail.com';
PRINT '═══════════════════════════════════════════════════════════════════════════════';
GO
