using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BizQuits.Models;

public class Service
{
    public int Id { get; set; }

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
    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Foreign key to EntrepreneurProfile
    public int EntrepreneurProfileId { get; set; }

    [ForeignKey("EntrepreneurProfileId")]
    public EntrepreneurProfile? EntrepreneurProfile { get; set; }
}
