using BizQuits.DTOs;
using BizQuits.Models;

namespace BizQuits.Services;

public interface IAuthService
{
    Task<User> Register(UserRegisterDto request);
    Task<AuthResponseDto> Login(UserLoginDto request);
    Task<AuthResponseDto> RefreshToken(string refreshToken);
    Task RevokeToken(string refreshToken, string reason = "User logout");
    Task RevokeAllUserTokens(int userId, string reason = "Security action");
}
