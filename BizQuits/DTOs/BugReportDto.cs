using BizQuits.Models;

namespace BizQuits.DTOs;

public class BugReportDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserEmail { get; set; } = "";

    public string Title { get; set; } = "";
    public string Description { get; set; } = "";

    public BugSeverity Severity { get; set; }
    public BugPriority Priority { get; set; }
    public BugStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }
}
