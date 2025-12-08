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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasOne(u => u.EntrepreneurProfile)
            .WithOne(p => p.User)
            .HasForeignKey<EntrepreneurProfile>(p => p.UserId);
        
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Service>()
            .HasOne(s => s.EntrepreneurProfile)
            .WithMany()
            .HasForeignKey(s => s.EntrepreneurProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Service>()
            .HasIndex(s => s.Category);

        modelBuilder.Entity<Service>()
            .HasIndex(s => s.IsActive);

        // Booking relationships
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
    }
}
