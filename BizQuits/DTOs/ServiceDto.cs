using System.ComponentModel.DataAnnotations;

namespace BizQuits.DTOs;

public class CreateServiceDto
{
    [Required]
    [MaxLength(200)]
    public required string Name { get; set; }

    [Required]
    [MaxLength(2000)]
    public required string Description { get; set; }

    [Required]
    [MaxLength(50)]
    public required string Category { get; set; }

    [Required]
    [MaxLength(50)]
    public required string Duration { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
    public decimal Price { get; set; }
}

public class UpdateServiceDto
{
    [Required]
    [MaxLength(200)]
    public required string Name { get; set; }

    [Required]
    [MaxLength(2000)]
    public required string Description { get; set; }

    [Required]
    [MaxLength(50)]
    public required string Category { get; set; }

    [Required]
    [MaxLength(50)]
    public required string Duration { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
    public decimal Price { get; set; }

    public bool IsActive { get; set; } = true;
}

public class ServiceResponseDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required string Category { get; set; }
    public required string Duration { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public EntrepreneurInfoDto? Entrepreneur { get; set; }
}

public class EntrepreneurInfoDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public required string CompanyName { get; set; }
    public required string Email { get; set; }
}
