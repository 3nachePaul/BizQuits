using System.ComponentModel.DataAnnotations;
using BizQuits.Models;

namespace BizQuits.DTOs;

public class UpdateBugReportStatusDto
{
    [Required]
    public BugStatus Status { get; set; }
}
