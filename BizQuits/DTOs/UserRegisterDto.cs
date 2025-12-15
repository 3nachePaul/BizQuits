using System.ComponentModel.DataAnnotations;
using BizQuits.Models;

namespace BizQuits.DTOs;

public class UserRegisterDto
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [MaxLength(256, ErrorMessage = "Email cannot exceed 256 characters")]
    public required string Email { get; set; }

    [Required(ErrorMessage = "Password is required")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
    [MaxLength(128, ErrorMessage = "Password cannot exceed 128 characters")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
        ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)")]
    public required string Password { get; set; }

    [Required(ErrorMessage = "Role is required")]
    [EnumDataType(typeof(Role), ErrorMessage = "Invalid role")]
    public Role Role { get; set; }

    [MaxLength(200, ErrorMessage = "Company name cannot exceed 200 characters")]
    public string? CompanyName { get; set; }

    [MaxLength(20, ErrorMessage = "CUI cannot exceed 20 characters")]
    [RegularExpression(@"^[A-Z0-9]+$", ErrorMessage = "CUI must contain only uppercase letters and numbers")]
    public string? CUI { get; set; }
}
