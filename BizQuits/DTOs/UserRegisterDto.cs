using System.ComponentModel.DataAnnotations;
using BizQuits.Models;

namespace BizQuits.DTOs;

public class UserRegisterDto
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    [MinLength(6)]
    public required string Password { get; set; }

    [Required]
    public Role Role { get; set; }

    public string? CompanyName { get; set; }

    public string? CUI { get; set; }
}
