using System.ComponentModel.DataAnnotations;

namespace BizQuits.DTOs;

public class UserLoginDto
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [MaxLength(256, ErrorMessage = "Email cannot exceed 256 characters")]
    public required string Email { get; set; }

    [Required(ErrorMessage = "Password is required")]
    [MaxLength(128, ErrorMessage = "Password cannot exceed 128 characters")]
    public required string Password { get; set; }
}

public class RefreshTokenDto
{
    [Required(ErrorMessage = "Refresh token is required")]
    public required string RefreshToken { get; set; }
}

public class AuthResponseDto
{
    public required string AccessToken { get; set; }
    public required string RefreshToken { get; set; }
    public DateTime AccessTokenExpiry { get; set; }
    public required UserInfoDto User { get; set; }
}

public class UserInfoDto
{
    public int Id { get; set; }
    public required string Email { get; set; }
    public required string Role { get; set; }
    public UserEntrepreneurProfileDto? EntrepreneurProfile { get; set; }
}

public class UserEntrepreneurProfileDto
{
    public int Id { get; set; }
    public required string CompanyName { get; set; }
    public required string CUI { get; set; }
    public bool IsApproved { get; set; }
}
