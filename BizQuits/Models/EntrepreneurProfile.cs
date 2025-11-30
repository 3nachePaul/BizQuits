using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BizQuits.Models;

public class EntrepreneurProfile
{
    public int Id { get; set; }

    public int UserId { get; set; }

    [ForeignKey("UserId")]
    public required User User { get; set; }

    [Required]
    public required string CompanyName { get; set; }

    [Required]
    public required string CUI { get; set; } // Cod Unic de Înregistrare

    public bool IsApproved { get; set; } = false;
}
