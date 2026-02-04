namespace BizQuits.DTOs;

public class AdminMonitoringOverviewDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsersLast24h { get; set; } // calculat din Messages
    public int TotalServices { get; set; }
    public int TotalOffers { get; set; }
    public int TotalChallenges { get; set; }
    public int TotalBookings { get; set; }
    public int TotalReviews { get; set; }
    public int TotalOfferClaims { get; set; }

    public int BugOpen { get; set; }
    public int BugInProgress { get; set; }
    public int BugResolved { get; set; }
    public int BugTotal { get; set; }
}
