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

    public EntrepreneurProfile? EntrepreneurProfile { get; set; }
}
