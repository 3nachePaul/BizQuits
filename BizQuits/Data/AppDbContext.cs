using BizQuits.Models;
using Microsoft.EntityFrameworkCore;

namespace BizQuits.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<EntrepreneurProfile> EntrepreneurProfiles { get; set; }
    public DbSet<Service> Services { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }

    // Gamification
    public DbSet<ClientStats> ClientStats { get; set; }
    public DbSet<Achievement> Achievements { get; set; }
    public DbSet<UserAchievement> UserAchievements { get; set; }

    // Reviews
    public DbSet<Review> Reviews { get; set; }

    // Offers
    public DbSet<Offer> Offers { get; set; }
    public DbSet<OfferClaim> OfferClaims { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // --------------------
        // User <-> EntrepreneurProfile (1:1)
        // --------------------
        modelBuilder.Entity<User>()
            .HasOne(u => u.EntrepreneurProfile)
            .WithOne(p => p.User)
            .HasForeignKey<EntrepreneurProfile>(p => p.UserId);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // --------------------
        // Service -> EntrepreneurProfile (many:1)
        // --------------------
        modelBuilder.Entity<Service>()
            .HasOne(s => s.EntrepreneurProfile)
            .WithMany()
            .HasForeignKey(s => s.EntrepreneurProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Service>()
            .HasIndex(s => s.Category);

        modelBuilder.Entity<Service>()
            .HasIndex(s => s.IsActive);

        // --------------------
        // Booking relationships
        // --------------------
        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Client)
            .WithMany()
            .HasForeignKey(b => b.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Service)
            .WithMany()
            .HasForeignKey(b => b.ServiceId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Booking>()
            .HasIndex(b => b.Status);

        modelBuilder.Entity<Booking>()
            .HasIndex(b => b.ClientId);

        modelBuilder.Entity<Booking>()
            .HasIndex(b => b.ServiceId);

        // --------------------
        // RefreshToken relationships
        // --------------------
        modelBuilder.Entity<RefreshToken>()
            .HasOne(rt => rt.User)
            .WithMany()
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RefreshToken>()
            .HasIndex(rt => rt.Token)
            .IsUnique();

        modelBuilder.Entity<RefreshToken>()
            .HasIndex(rt => rt.UserId);

        // --------------------
        // Gamification: ClientStats
        // 1 stats row per client user
        // --------------------
        modelBuilder.Entity<ClientStats>()
            .HasIndex(cs => cs.UserId)
            .IsUnique();

        // (optional but recommended) if you want an explicit relationship
        modelBuilder.Entity<ClientStats>()
            .HasOne(cs => cs.User)
            .WithMany()
            .HasForeignKey(cs => cs.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // --------------------
        // Gamification: Achievements
        // unique code per achievement
        // --------------------
        modelBuilder.Entity<Achievement>()
            .HasIndex(a => a.Code)
            .IsUnique();

        // --------------------
        // Gamification: UserAchievements
        // no duplicate unlocks per user+achievement
        // --------------------
        modelBuilder.Entity<UserAchievement>()
            .HasIndex(ua => new { ua.UserId, ua.AchievementId })
            .IsUnique();

        modelBuilder.Entity<UserAchievement>()
            .HasOne(ua => ua.User)
            .WithMany()
            .HasForeignKey(ua => ua.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserAchievement>()
            .HasOne(ua => ua.Achievement)
            .WithMany()
            .HasForeignKey(ua => ua.AchievementId)
            .OnDelete(DeleteBehavior.Cascade);

        // --------------------
        // Reviews
        // one review per client per service
        // --------------------
        modelBuilder.Entity<Review>()
            .HasIndex(r => new { r.ServiceId, r.ClientId })
            .IsUnique();

        modelBuilder.Entity<Review>()
            .HasOne(r => r.Service)
            .WithMany()
            .HasForeignKey(r => r.ServiceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.Client)
            .WithMany()
            .HasForeignKey(r => r.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        // --------------------
        // Offers
        // --------------------
        modelBuilder.Entity<Offer>()
            .HasOne(o => o.EntrepreneurProfile)
            .WithMany()
            .HasForeignKey(o => o.EntrepreneurProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Offer>()
            .HasIndex(o => o.Type);

        modelBuilder.Entity<Offer>()
            .HasIndex(o => o.IsActive);

        // --------------------
        // OfferClaims
        // one claim per user per offer
        // --------------------
        modelBuilder.Entity<OfferClaim>()
            .HasIndex(oc => new { oc.UserId, oc.OfferId })
            .IsUnique();

        modelBuilder.Entity<OfferClaim>()
            .HasOne(oc => oc.Offer)
            .WithMany()
            .HasForeignKey(oc => oc.OfferId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<OfferClaim>()
            .HasOne(oc => oc.User)
            .WithMany()
            .HasForeignKey(oc => oc.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OfferClaim>()
            .HasIndex(oc => oc.ClaimCode);
    }
}
