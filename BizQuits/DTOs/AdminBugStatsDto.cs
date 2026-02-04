namespace BizQuits.DTOs;

public class AdminBugStatsDto
{
    public int Days { get; set; }

    // time series
    public List<DailyCountDto> BugsCreatedPerDay { get; set; } = new();

    // distributions
    public List<KeyValueIntDto> BugsByStatus { get; set; } = new();
    public List<KeyValueIntDto> BugsBySeverity { get; set; } = new();
    public List<KeyValueIntDto> BugsByPriority { get; set; } = new();
}

public class DailyCountDto
{
    public string Day { get; set; } = ""; // "YYYY-MM-DD"
    public int Count { get; set; }
}

public class KeyValueIntDto
{
    public string Key { get; set; } = "";
    public int Value { get; set; }
}
