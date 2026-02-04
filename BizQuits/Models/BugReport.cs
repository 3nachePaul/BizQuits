using System.ComponentModel.DataAnnotations;

namespace BizQuits.Models;
public class BugReport
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; }

    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;

    public BugSeverity Severity { get; set; }   // Low, Medium, High, Critical
    public BugStatus Status { get; set; }       // Open, InProgress, Resolved

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public BugPriority Priority { get; set; } = BugPriority.Normal;
    
    public string? AdminNotes { get; set; }
    
    public DateTime? UpdatedAt { get; set; }

}
