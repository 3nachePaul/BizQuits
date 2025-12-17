using System.ComponentModel.DataAnnotations;
using BizQuits.Models;

namespace BizQuits.DTOs;

public class CreateOfferDto
{
    [Required(ErrorMessage = "Titlul este obligatoriu")]
    [MaxLength(200, ErrorMessage = "Titlul nu poate depăși 200 de caractere")]
    public required string Title { get; set; }

    [Required(ErrorMessage = "Descrierea este obligatorie")]
    [MaxLength(2000, ErrorMessage = "Descrierea nu poate depăși 2000 de caractere")]
    public required string Description { get; set; }

    [Required(ErrorMessage = "Tipul ofertei este obligatoriu")]
    [EnumDataType(typeof(OfferType), ErrorMessage = "Tip de ofertă invalid")]
    public OfferType Type { get; set; }

    [Range(1, 1000, ErrorMessage = "Numărul trebuie să fie între 1 și 1000")]
    public int? MilestoneCount { get; set; }

    [Range(1, 365, ErrorMessage = "Zilele trebuie să fie între 1 și 365")]
    public int? EarlyCompletionDays { get; set; }

    [Range(0.01, 100, ErrorMessage = "Procentul trebuie să fie între 0.01 și 100")]
    public decimal? DiscountPercentage { get; set; }

    [Range(0.01, 100000, ErrorMessage = "Valoarea trebuie să fie pozitivă")]
    public decimal? BonusValue { get; set; }

    [MaxLength(500, ErrorMessage = "Descrierea recompensei nu poate depăși 500 de caractere")]
    public string? RewardDescription { get; set; }

    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidUntil { get; set; }
}

public class UpdateOfferDto
{
    [Required(ErrorMessage = "Titlul este obligatoriu")]
    [MaxLength(200, ErrorMessage = "Titlul nu poate depăși 200 de caractere")]
    public required string Title { get; set; }

    [Required(ErrorMessage = "Descrierea este obligatorie")]
    [MaxLength(2000, ErrorMessage = "Descrierea nu poate depăși 2000 de caractere")]
    public required string Description { get; set; }

    [Required(ErrorMessage = "Tipul ofertei este obligatoriu")]
    [EnumDataType(typeof(OfferType), ErrorMessage = "Tip de ofertă invalid")]
    public OfferType Type { get; set; }

    [Range(1, 1000, ErrorMessage = "Numărul trebuie să fie între 1 și 1000")]
    public int? MilestoneCount { get; set; }

    [Range(1, 365, ErrorMessage = "Zilele trebuie să fie între 1 și 365")]
    public int? EarlyCompletionDays { get; set; }

    [Range(0.01, 100, ErrorMessage = "Procentul trebuie să fie între 0.01 și 100")]
    public decimal? DiscountPercentage { get; set; }

    [Range(0.01, 100000, ErrorMessage = "Valoarea trebuie să fie pozitivă")]
    public decimal? BonusValue { get; set; }

    [MaxLength(500, ErrorMessage = "Descrierea recompensei nu poate depăși 500 de caractere")]
    public string? RewardDescription { get; set; }

    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidUntil { get; set; }

    public bool IsActive { get; set; }
}

public class OfferResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string TypeDisplayName { get; set; } = string.Empty;
    public int? MilestoneCount { get; set; }
    public int? EarlyCompletionDays { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public decimal? BonusValue { get; set; }
    public string? RewardDescription { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidUntil { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public EntrepreneurInfoDto? Entrepreneur { get; set; }
    public bool IsClaimed { get; set; }
    public OfferClaimResponseDto? MyClaim { get; set; }
}

public class OfferClaimResponseDto
{
    public int Id { get; set; }
    public int OfferId { get; set; }
    public string OfferTitle { get; set; } = string.Empty;
    public string? ClaimCode { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime ClaimedAt { get; set; }
    public DateTime? UsedAt { get; set; }
    public string? Notes { get; set; }
    public OfferResponseDto? Offer { get; set; }
}

public class ClaimOfferDto
{
    public string? Notes { get; set; }
}
