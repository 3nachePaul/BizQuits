using System.ComponentModel.DataAnnotations;
using BizQuits.Models;

namespace BizQuits.DTOs;

public class CreateBugReportDto
{
    [Required]
    [MaxLength(120)]
    public string Title { get; set; } = null!;

    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = null!;

    public BugSeverity Severity { get; set; } = BugSeverity.Low;
    public BugPriority Priority { get; set; } = BugPriority.Normal;
}
