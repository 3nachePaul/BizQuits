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
    }
}
