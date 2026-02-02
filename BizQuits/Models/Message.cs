using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BizQuits.Models;

public class Message
{
    public int Id { get; set; }

    // Link to the service this conversation is about
    [Required]
    public int ServiceId { get; set; }
    [ForeignKey("ServiceId")]
    public Service Service { get; set; } = null!;

    [Required]
    public int SenderId { get; set; }
    [ForeignKey("SenderId")]
    public User Sender { get; set; } = null!;

    [Required]
    public int RecipientId { get; set; }
    [ForeignKey("RecipientId")]
    public User Recipient { get; set; } = null!;

    [Required]
    [MaxLength(2000)]
    public string Content { get; set; } = string.Empty;

    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; } = false;
}
