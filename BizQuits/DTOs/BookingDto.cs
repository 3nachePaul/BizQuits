using System.ComponentModel.DataAnnotations;

namespace BizQuits.DTOs;

public class CreateBookingDto
{
    [Required]
    public int ServiceId { get; set; }

    [MaxLength(1000)]
    public string? Message { get; set; }
}

public class UpdateBookingStatusDto
{
    [Required]
    public string Status { get; set; } = string.Empty; // "Accepted", "Rejected", "InProgress", "Completed", "Cancelled"

    [MaxLength(1000)]
    public string? Response { get; set; }
}

public class BookingResponseDto
{
    public int Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Message { get; set; }
    public string? EntrepreneurResponse { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public BookingServiceDto? Service { get; set; }
    public BookingClientDto? Client { get; set; }
}

public class BookingServiceDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? EntrepreneurCompanyName { get; set; }
}

public class BookingClientDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
}
