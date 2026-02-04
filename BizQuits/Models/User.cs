using System.ComponentModel.DataAnnotations;

namespace BizQuits.Models;

public class User
{
    public int Id { get; set; }

    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    public required string PasswordHash { get; set; }

    [Required]
    public Role Role { get; set; }

    // Monetization: coins for offers and rewards
    public int Coins { get; set; } = 0;

    // Tutorial tracking - only show on first ever login
    public bool HasSeenTutorial { get; set; } = false;

    public EntrepreneurProfile? EntrepreneurProfile { get; set; }
}
