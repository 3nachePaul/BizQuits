using System.ComponentModel.DataAnnotations;

namespace BizQuits.DTOs;

public class CreateReviewDto
{
    [Range(1,5)]
    public int Rating { get; set; }

    [MaxLength(1000)]
    public string? Comment { get; set; }
}
