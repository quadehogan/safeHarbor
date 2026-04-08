using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using SafeHarbor.API.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace SafeHarbor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IConfiguration _configuration;

    public AuthController(UserManager<IdentityUser> userManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        var user = new IdentityUser { UserName = request.Email, Email = request.Email };
        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        // First registered user is Admin; donors self-register with role "DonorPortal";
        // staff accounts must be created by an Admin.
        var userCount = _userManager.Users.Count();
        var roleName = userCount <= 1 ? "Admin"
            : request.Role == "DonorPortal" ? "DonorPortal"
            : "SocialWorker";
        await _userManager.AddToRoleAsync(user, roleName);

        var roles = await _userManager.GetRolesAsync(user);
        var token = CreateJwtToken(user, roles);
        return Ok(new AuthResponse { Token = token, Email = user.Email ?? "", Roles = roles });
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
            return Unauthorized();

        var valid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!valid)
            return Unauthorized();

        var roles = await _userManager.GetRolesAsync(user);
        var token = CreateJwtToken(user, roles);
        return Ok(new AuthResponse { Token = token, Email = user.Email ?? "", Roles = roles });
    }

    // Debug: check what Google config values the app can see
    [AllowAnonymous]
    [HttpGet("google-debug")]
    public IActionResult GoogleDebug()
    {
        var clientId = _configuration["Google:ClientId"];
        var hasSecret = !string.IsNullOrWhiteSpace(_configuration["Google:ClientSecret"]);
        return Ok(new
        {
            clientIdPresent = !string.IsNullOrWhiteSpace(clientId),
            clientIdPrefix = clientId?.Length > 10 ? clientId[..10] + "..." : clientId,
            clientSecretPresent = hasSecret,
        });
    }

    // Google OAuth: redirect user to Google's login page
    [AllowAnonymous]
    [HttpGet("google-login")]
    public IActionResult GoogleLogin()
    {
        var clientId = _configuration["Google:ClientId"]
            ?? Environment.GetEnvironmentVariable("Google__ClientId")
            ?? Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID");
        var clientSecret = _configuration["Google:ClientSecret"]
            ?? Environment.GetEnvironmentVariable("Google__ClientSecret")
            ?? Environment.GetEnvironmentVariable("GOOGLE_CLIENT_SECRET");

        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
            return BadRequest("Google sign-in is not configured. Check env vars Google__ClientId and Google__ClientSecret.");

        var redirectUrl = Url.Action(nameof(GoogleCallback), "Auth");
        var properties = new AuthenticationProperties { RedirectUri = redirectUrl };
        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    // Google OAuth: handle the callback after Google authenticates the user
    [AllowAnonymous]
    [HttpGet("google-callback")]
    public async Task<IActionResult> GoogleCallback()
    {

        var result = await HttpContext.AuthenticateAsync(GoogleDefaults.AuthenticationScheme);
        if (!result.Succeeded)
            return Unauthorized();

        var email = result.Principal?.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
            return BadRequest("Google account has no email.");

        // Find or create the user in our Identity system
        var user = await _userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = new IdentityUser { UserName = email, Email = email, EmailConfirmed = true };
            var createResult = await _userManager.CreateAsync(user);
            if (!createResult.Succeeded)
                return BadRequest(createResult.Errors);
            // Google-authenticated users get DonorPortal role by default
            await _userManager.AddToRoleAsync(user, "DonorPortal");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var token = CreateJwtToken(user, roles);

        // Redirect to frontend with the JWT token
        var frontendUrl = _configuration["FrontendUrl"] ?? "https://icy-sky-01a399a1e.2.azurestaticapps.net";
        return Redirect($"{frontendUrl}/login?token={token}&email={Uri.EscapeDataString(email)}&roles={Uri.EscapeDataString(string.Join(",", roles))}");
    }

    private string CreateJwtToken(IdentityUser user, IList<string> roles)
    {
        var key = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key missing");
        var issuer = _configuration["Jwt:Issuer"] ?? "SafeHarbor";
        var audience = _configuration["Jwt:Audience"] ?? "SafeHarbor";

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new(ClaimTypes.NameIdentifier, user.Id),
        };
        foreach (var role in roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
