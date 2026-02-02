using System.ComponentModel.DataAnnotations;

namespace BizQuits.DTOs;

public class SendMessageDto
{
    [Required]
    public int ServiceId { get; set; }
    
    // RecipientId is optional - if not provided, determined by service context
    public int? RecipientId { get; set; }
    
    [Required]
    [MaxLength(2000)]
    public string Content { get; set; } = string.Empty;
}

public class MessageDto
{
    public int Id { get; set; }
    public int ServiceId { get; set; }
    public int SenderId { get; set; }
    public int RecipientId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
    public bool IsRead { get; set; }
}
