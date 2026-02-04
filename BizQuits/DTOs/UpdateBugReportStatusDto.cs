using System.ComponentModel.DataAnnotations;
using BizQuits.Models;

namespace BizQuits.DTOs;

public class UpdateBugReportStatusDto
{
    [Required]
    public BugStatus Status { get; set; }
}

public class UpdateBugReportSeverityDto
{
    [Required]
    public BugSeverity Severity { get; set; }
}

public class UpdateBugReportPriorityDto
{
    [Required]
    public BugPriority Priority { get; set; }
}
