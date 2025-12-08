-- BizQuits Database Initialization Script
-- This script creates all tables needed for the application
-- Run this after starting the Docker container, or use EF migrations

-- Create the database if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'BizQuits')
BEGIN
    CREATE DATABASE BizQuits;
END
GO

USE BizQuits;
GO

-- Create Users table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
BEGIN
    CREATE TABLE Users (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Email NVARCHAR(450) NOT NULL,
        PasswordHash NVARCHAR(MAX) NOT NULL,
        Role INT NOT NULL
    );

    -- Create unique index on Email
    CREATE UNIQUE INDEX IX_Users_Email ON Users(Email);
END
GO

-- Create EntrepreneurProfiles table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EntrepreneurProfiles' AND xtype='U')
BEGIN
    CREATE TABLE EntrepreneurProfiles (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        CompanyName NVARCHAR(MAX) NOT NULL,
        CUI NVARCHAR(MAX) NOT NULL,
        IsApproved BIT NOT NULL DEFAULT 0,
        CONSTRAINT FK_EntrepreneurProfiles_Users_UserId 
            FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
    );

    -- Create unique index on UserId
    CREATE UNIQUE INDEX IX_EntrepreneurProfiles_UserId ON EntrepreneurProfiles(UserId);
END
GO

-- Create Services table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Services' AND xtype='U')
BEGIN
    CREATE TABLE Services (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(200) NOT NULL,
        Description NVARCHAR(2000) NOT NULL,
        Category NVARCHAR(50) NOT NULL,
        Duration NVARCHAR(50) NOT NULL,
        Price DECIMAL(18,2) NOT NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL,
        EntrepreneurProfileId INT NOT NULL,
        CONSTRAINT FK_Services_EntrepreneurProfiles_EntrepreneurProfileId 
            FOREIGN KEY (EntrepreneurProfileId) REFERENCES EntrepreneurProfiles(Id) ON DELETE CASCADE
    );

    -- Create indexes
    CREATE INDEX IX_Services_Category ON Services(Category);
    CREATE INDEX IX_Services_IsActive ON Services(IsActive);
    CREATE INDEX IX_Services_EntrepreneurProfileId ON Services(EntrepreneurProfileId);
END
GO

-- EF Core Migrations History table (so EF knows the schema is up to date)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='__EFMigrationsHistory' AND xtype='U')
BEGIN
    CREATE TABLE __EFMigrationsHistory (
        MigrationId NVARCHAR(150) NOT NULL PRIMARY KEY,
        ProductVersion NVARCHAR(32) NOT NULL
    );

    -- Mark the initial migration as applied
    INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
    VALUES ('20251128183608_InitialCreate', '9.0.0');
END
GO

-- Add Services migration entry if not exists
IF NOT EXISTS (SELECT * FROM __EFMigrationsHistory WHERE MigrationId = '20251208113358_AddServicesTable')
BEGIN
    INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
    VALUES ('20251208113358_AddServicesTable', '9.0.0');
END
GO

PRINT 'BizQuits database initialized successfully!';
GO
