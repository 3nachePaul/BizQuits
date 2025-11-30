using BizQuits.DTOs;
using BizQuits.Models;

namespace BizQuits.Services;

public interface IAuthService
{
    Task<User> Register(UserRegisterDto request);
    Task<string> Login(UserLoginDto request);
}
