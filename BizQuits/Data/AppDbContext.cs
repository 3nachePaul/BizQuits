using BizQuits.Models;
using Microsoft.EntityFrameworkCore;

namespace BizQuits.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }




    public DbSet<User> Users { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<Service> Services { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<Offer> Offers { get; set; }
    public DbSet<EntrepreneurProfile> EntrepreneurProfiles { get; set; }
    public DbSet<ClientStats> ClientStats { get; set; }
    public DbSet<UserAchievement> UserAchievements { get; set; }
    public DbSet<ChallengeParticipation> ChallengeParticipations { get; set; }
    public DbSet<Challenge> Challenges { get; set; }
    public DbSet<OfferClaim> OfferClaims { get; set; }

    public DbSet<Achievement> Achievements { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // --------------------
        // Message relationships
        // --------------------
        modelBuilder.Entity<Message>()
            .HasOne(m => m.Sender)
            .WithMany()
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Message>()
            .HasOne(m => m.Recipient)
            .WithMany()
            .HasForeignKey(m => m.RecipientId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Message>()
            .HasIndex(m => m.SenderId);
        modelBuilder.Entity<Message>()
            .HasIndex(m => m.RecipientId);
        modelBuilder.Entity<Message>()
            .HasIndex(m => m.SentAt);

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

        // --------------------
        // Challenges (Sprint 4)
        // --------------------
        modelBuilder.Entity<Challenge>()
            .HasOne(c => c.EntrepreneurProfile)
            .WithMany()
            .HasForeignKey(c => c.EntrepreneurProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Challenge>()
            .HasIndex(c => c.Type);

        modelBuilder.Entity<Challenge>()
            .HasIndex(c => c.Status);

        // --------------------
        // ChallengeParticipations
        // one participation per user per challenge
        // --------------------
        modelBuilder.Entity<ChallengeParticipation>()
            .HasIndex(cp => new { cp.UserId, cp.ChallengeId })
            .IsUnique();

        modelBuilder.Entity<ChallengeParticipation>()
            .HasOne(cp => cp.Challenge)
            .WithMany()
            .HasForeignKey(cp => cp.ChallengeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ChallengeParticipation>()
            .HasOne(cp => cp.User)
            .WithMany()
            .HasForeignKey(cp => cp.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ChallengeParticipation>()
            .HasIndex(cp => cp.Status);
    }
}
