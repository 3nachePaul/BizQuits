using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BizQuits.Models;

public enum BookingStatus
{
    Pending = 0,
    Accepted = 1,
    Rejected = 2,
    InProgress = 3,
    Completed = 4,
    Cancelled = 5
}

public class Booking
{
    public int Id { get; set; }

    // Client who made the booking
    public int ClientId { get; set; }

    [ForeignKey("ClientId")]
    public User? Client { get; set; }

    // Service being booked
    public int ServiceId { get; set; }

    [ForeignKey("ServiceId")]
    public Service? Service { get; set; }

    [Required]
    public BookingStatus Status { get; set; } = BookingStatus.Pending;

    [MaxLength(1000)]
    public string? Message { get; set; } // Optional message from client

    [MaxLength(1000)]
    public string? EntrepreneurResponse { get; set; } // Response from entrepreneur

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? CompletedDate { get; set; }
}
