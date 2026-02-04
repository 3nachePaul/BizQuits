
using BizQuits.Data;
using BizQuits.Models;
using BizQuits.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BizQuits.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessageController : ControllerBase
{
    private readonly AppDbContext _context;

    public MessageController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/message
    // Send a message about a specific service (client <-> entrepreneur only)
    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageDto dto)
    {
        var senderEmail = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(senderEmail)) return Unauthorized();
        
        var sender = await _context.Users.FirstOrDefaultAsync(u => u.Email == senderEmail);
        if (sender == null) return Unauthorized();
        
        if (string.IsNullOrWhiteSpace(dto.Content)) 
            return BadRequest("Message content required");
        
        // Get the service and its entrepreneur
        var service = await _context.Services
            .Include(s => s.EntrepreneurProfile)
            .FirstOrDefaultAsync(s => s.Id == dto.ServiceId);
        
        if (service == null) 
            return NotFound("Service not found");
        
        if (service.EntrepreneurProfile == null)
            return BadRequest("Service has no entrepreneur");
        
        var entrepreneurUserId = service.EntrepreneurProfile.UserId;
        
        // Check if the job is completed (archived) - no more messages allowed
        var booking = await _context.Bookings
            .Where(b => b.ServiceId == dto.ServiceId && 
                       (b.ClientId == sender.Id || entrepreneurUserId == sender.Id))
            .OrderByDescending(b => b.CreatedAt)
            .FirstOrDefaultAsync();
        
        if (booking != null && booking.Status == BookingStatus.Completed)
            return BadRequest("This conversation is archived. The job has been completed.");
        
        // Determine sender and recipient roles
        bool senderIsEntrepreneur = sender.Id == entrepreneurUserId;
        bool senderIsClient = !senderIsEntrepreneur;
        
        int recipientId;
        if (senderIsEntrepreneur)
        {
            // Entrepreneur sending to client - need to know which client
            // Find the client from existing messages or from the most recent booking
            if (dto.RecipientId.HasValue)
            {
                recipientId = dto.RecipientId.Value;
            }
            else
            {
                // Try to find from existing conversation or booking
                var existingClientId = await _context.Messages
                    .Where(m => m.ServiceId == dto.ServiceId && m.SenderId != sender.Id)
                    .Select(m => m.SenderId)
                    .FirstOrDefaultAsync();
                
                if (existingClientId == 0)
                {
                    existingClientId = await _context.Bookings
                        .Where(b => b.ServiceId == dto.ServiceId)
                        .OrderByDescending(b => b.CreatedAt)
                        .Select(b => b.ClientId)
                        .FirstOrDefaultAsync();
                }
                
                if (existingClientId == 0)
                    return BadRequest("No client found for this conversation");
                
                recipientId = existingClientId;
            }
        }
        else
        {
            // Client sending to entrepreneur
            recipientId = entrepreneurUserId;
        }
        
        // Verify recipient exists
        var recipient = await _context.Users.FindAsync(recipientId);
        if (recipient == null) 
            return NotFound("Recipient not found");
        
        // Verify client-entrepreneur relationship (no client-client or entrepreneur-entrepreneur)
        bool recipientIsEntrepreneur = recipientId == entrepreneurUserId;
        if (senderIsEntrepreneur && recipientIsEntrepreneur)
            return BadRequest("Cannot send messages between entrepreneurs");
        if (senderIsClient && !recipientIsEntrepreneur)
            return BadRequest("Clients can only message the service entrepreneur");
        
        var message = new Message
        {
            ServiceId = dto.ServiceId,
            SenderId = sender.Id,
            RecipientId = recipientId,
            Content = dto.Content.Trim(),
            SentAt = DateTime.UtcNow
        };
        
        _context.Messages.Add(message);
        await _context.SaveChangesAsync();
        
        return Ok(new MessageDto
        {
            Id = message.Id,
            ServiceId = message.ServiceId,
            SenderId = message.SenderId,
            RecipientId = message.RecipientId,
            Content = message.Content,
            SentAt = message.SentAt,
            IsRead = message.IsRead
        });
    }

    // GET: api/message/conversation/service/{serviceId}
    // Get all messages for a specific service conversation
    [HttpGet("conversation/service/{serviceId}")]
    public async Task<IActionResult> GetServiceConversation(int serviceId)
    {
        var myEmail = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(myEmail)) return Unauthorized();
        
        var me = await _context.Users.FirstOrDefaultAsync(u => u.Email == myEmail);
        if (me == null) return Unauthorized();
        
        // Verify user is part of this conversation (client or entrepreneur)
        var service = await _context.Services
            .Include(s => s.EntrepreneurProfile)
            .FirstOrDefaultAsync(s => s.Id == serviceId);
        
        if (service == null) 
            return NotFound("Service not found");
        
        var entrepreneurUserId = service.EntrepreneurProfile?.UserId ?? 0;
        
        // Check if user is the entrepreneur
        bool isEntrepreneur = me.Id == entrepreneurUserId;
        
        // For clients, just return messages where they are sender or recipient
        // No need to check if they "have permission" - they can only see their own messages anyway
        var messages = await _context.Messages
            .Where(m => m.ServiceId == serviceId && 
                       (m.SenderId == me.Id || m.RecipientId == me.Id))
            .OrderBy(m => m.SentAt)
            .Select(m => new MessageDto
            {
                Id = m.Id,
                ServiceId = m.ServiceId,
                SenderId = m.SenderId,
                RecipientId = m.RecipientId,
                Content = m.Content,
                SentAt = m.SentAt,
                IsRead = m.IsRead
            })
            .ToListAsync();
        
        return Ok(messages);
    }

    // GET: api/message/conversations
    // Get all service conversations for the current user
    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var myEmail = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(myEmail)) return Unauthorized();
        
        var me = await _context.Users.FirstOrDefaultAsync(u => u.Email == myEmail);
        if (me == null) return Unauthorized();
        
        // Get all service IDs where user has messages
        var serviceIdsFromMessages = await _context.Messages
            .Where(m => m.SenderId == me.Id || m.RecipientId == me.Id)
            .Select(m => m.ServiceId)
            .Distinct()
            .ToListAsync();
        
        // Also get service IDs from bookings (for conversations that haven't started yet)
        var serviceIdsFromBookings = await _context.Bookings
            .Include(b => b.Service)
            .ThenInclude(s => s!.EntrepreneurProfile)
            .Where(b => b.ClientId == me.Id || b.Service!.EntrepreneurProfile!.UserId == me.Id)
            .Where(b => b.Status != BookingStatus.Cancelled && b.Status != BookingStatus.Rejected)
            .Select(b => b.ServiceId)
            .Distinct()
            .ToListAsync();
        
        // Combine both lists
        var serviceIds = serviceIdsFromMessages.Union(serviceIdsFromBookings).ToList();
        
        var conversations = new List<object>();
        
        foreach (var serviceId in serviceIds)
        {
            var service = await _context.Services
                .Include(s => s.EntrepreneurProfile)
                .ThenInclude(ep => ep!.User)
                .FirstOrDefaultAsync(s => s.Id == serviceId);
            
            if (service == null) continue;
            
            // Get the last message (might be null if no messages yet)
            var lastMessage = await _context.Messages
                .Where(m => m.ServiceId == serviceId && 
                           (m.SenderId == me.Id || m.RecipientId == me.Id))
                .OrderByDescending(m => m.SentAt)
                .FirstOrDefaultAsync();
            
            // Get unread count
            var unreadCount = await _context.Messages
                .CountAsync(m => m.ServiceId == serviceId && 
                                m.RecipientId == me.Id && 
                                !m.IsRead);
            
            // Get the booking for this service
            var booking = await _context.Bookings
                .Where(b => b.ServiceId == serviceId && 
                           (b.ClientId == me.Id || service.EntrepreneurProfile!.UserId == me.Id))
                .OrderByDescending(b => b.CreatedAt)
                .FirstOrDefaultAsync();
            
            bool isArchived = booking?.Status == BookingStatus.Completed;
            
            // Determine the other party in the conversation
            int otherUserId;
            if (me.Id == service.EntrepreneurProfile?.UserId)
            {
                // I'm the entrepreneur - find the client
                otherUserId = lastMessage != null 
                    ? (lastMessage.SenderId == me.Id ? lastMessage.RecipientId : lastMessage.SenderId)
                    : booking?.ClientId ?? 0;
            }
            else
            {
                // I'm the client - the other party is the entrepreneur
                otherUserId = service.EntrepreneurProfile?.UserId ?? 0;
            }
            
            var otherUser = await _context.Users.FindAsync(otherUserId);
            
            conversations.Add(new
            {
                ServiceId = serviceId,
                ServiceName = service.Name,
                EntrepreneurName = service.EntrepreneurProfile?.User?.Email ?? "Unknown",
                OtherParty = new { Id = otherUser?.Id ?? 0, Email = otherUser?.Email ?? "Unknown" },
                LastMessage = lastMessage?.Content ?? "No messages yet",
                LastMessageAt = lastMessage?.SentAt ?? booking?.CreatedAt,
                UnreadCount = unreadCount,
                IsArchived = isArchived,
                BookingStatus = booking?.Status.ToString()
            });
        }
        
        return Ok(conversations.OrderByDescending(c => ((dynamic)c).LastMessageAt));
    }

    // POST: api/message/read/{messageId}
    // Mark a message as read
    [HttpPost("read/{messageId}")]
    public async Task<IActionResult> MarkAsRead(int messageId)
    {
        var myEmail = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(myEmail)) return Unauthorized();
        
        var me = await _context.Users.FirstOrDefaultAsync(u => u.Email == myEmail);
        if (me == null) return Unauthorized();
        
        var message = await _context.Messages.FindAsync(messageId);
        if (message == null) return NotFound();
        
        if (message.RecipientId != me.Id)
            return Forbid("Cannot mark others' messages as read");
        
        message.IsRead = true;
        await _context.SaveChangesAsync();
        
        return Ok();
    }

    // POST: api/message/read/service/{serviceId}
    // Mark all messages in a service conversation as read
    [HttpPost("read/service/{serviceId}")]
    public async Task<IActionResult> MarkConversationAsRead(int serviceId)
    {
        var myEmail = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(myEmail)) return Unauthorized();
        
        var me = await _context.Users.FirstOrDefaultAsync(u => u.Email == myEmail);
        if (me == null) return Unauthorized();
        
        // Mark all unread messages sent TO me in this conversation as read
        var unreadMessages = await _context.Messages
            .Where(m => m.ServiceId == serviceId && 
                       m.RecipientId == me.Id && 
                       !m.IsRead)
            .ToListAsync();
        
        foreach (var msg in unreadMessages)
        {
            msg.IsRead = true;
        }
        
        await _context.SaveChangesAsync();
        
        return Ok(new { markedAsRead = unreadMessages.Count });
    }
}
