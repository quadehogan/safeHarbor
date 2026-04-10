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

        // MFA: if the user has 2FA enabled, issue a short-lived signed cookie instead of the
        // full JWT. The frontend redirects to /mfa-verify to complete the login.
        if (user.TwoFactorEnabled)
        {
            var pendingToken = CreateMfaPendingToken(user.Id);
            Response.Cookies.Append("mfa_pending", pendingToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddMinutes(5),
                Path = "/api/auth",
            });
            return Ok(new { requiresMfa = true });
        }

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

    // ── MFA ENDPOINTS ────────────────────────────────────────────────────────────

    // GET /api/auth/mfa-setup
    // Returns the otpauth:// URI so the frontend can render a QR code, plus whether
    // 2FA is already enabled. Generates a new authenticator key if none exists yet.
    [Authorize]
    [HttpGet("mfa-setup")]
    public async Task<IActionResult> GetMfaSetup()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _userManager.FindByIdAsync(userId!);
        if (user is null) return Unauthorized();

        var key = await _userManager.GetAuthenticatorKeyAsync(user);
        if (string.IsNullOrEmpty(key))
        {
            await _userManager.ResetAuthenticatorKeyAsync(user);
            key = await _userManager.GetAuthenticatorKeyAsync(user);
        }

        var issuer = Uri.EscapeDataString("SafeHarbor");
        var emailParam = Uri.EscapeDataString(user.Email ?? user.UserName ?? "");
        var otpAuthUri = $"otpauth://totp/{issuer}:{emailParam}?secret={key}&issuer={issuer}&algorithm=SHA1&digits=6&period=30";

        return Ok(new { otpAuthUri, isEnabled = user.TwoFactorEnabled });
    }

    // POST /api/auth/mfa-setup
    // Verifies the provided TOTP code against the stored authenticator key and,
    // if valid, enables 2FA on the account.
    [Authorize]
    [HttpPost("mfa-setup")]
    public async Task<IActionResult> EnableMfa([FromBody] MfaSetupRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _userManager.FindByIdAsync(userId!);
        if (user is null) return Unauthorized();

        var code = request.Code.Replace(" ", "").Replace("-", "");
        var isValid = await _userManager.VerifyTwoFactorTokenAsync(
            user,
            _userManager.Options.Tokens.AuthenticatorTokenProvider,
            code);

        if (!isValid)
            return BadRequest(new { error = "Invalid verification code. Check your authenticator app and try again." });

        await _userManager.SetTwoFactorEnabledAsync(user, true);
        return Ok(new { message = "MFA enabled successfully." });
    }

    // POST /api/auth/mfa-verify
    // Called after a login that returned requiresMfa: true. Reads the short-lived
    // signed cookie set during Login, verifies the TOTP code, and issues the full JWT.
    [AllowAnonymous]
    [HttpPost("mfa-verify")]
    public async Task<ActionResult<AuthResponse>> MfaVerify([FromBody] MfaVerifyRequest request)
    {
        if (!Request.Cookies.TryGetValue("mfa_pending", out var pendingToken) || string.IsNullOrEmpty(pendingToken))
            return Unauthorized();

        var userId = ValidateMfaPendingToken(pendingToken);
        if (userId is null) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null) return Unauthorized();

        var code = request.Code.Replace(" ", "").Replace("-", "");
        var isValid = await _userManager.VerifyTwoFactorTokenAsync(
            user,
            _userManager.Options.Tokens.AuthenticatorTokenProvider,
            code);

        if (!isValid) return Unauthorized();

        // Clear the pending cookie now that login is complete
        Response.Cookies.Delete("mfa_pending", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Path = "/api/auth",
        });

        var roles = await _userManager.GetRolesAsync(user);
        var token = CreateJwtToken(user, roles);
        return Ok(new AuthResponse { Token = token, Email = user.Email ?? "", Roles = roles });
    }

    // POST /api/auth/mfa-disable
    // Disables 2FA and resets the authenticator key on the account.
    [Authorize]
    [HttpPost("mfa-disable")]
    public async Task<IActionResult> DisableMfa()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _userManager.FindByIdAsync(userId!);
        if (user is null) return Unauthorized();

        await _userManager.SetTwoFactorEnabledAsync(user, false);
        await _userManager.ResetAuthenticatorKeyAsync(user);
        return Ok(new { message = "MFA disabled." });
    }

    // ── MFA HELPERS ───────────────────────────────────────────────────────────────

    // Creates a short-lived JWT (5 min) containing a mfa_pending claim and the user ID.
    // This is stored in an httpOnly cookie between the /login and /mfa-verify calls.
    private string CreateMfaPendingToken(string userId)
    {
        var key = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key missing");
        var issuer = _configuration["Jwt:Issuer"] ?? "SafeHarbor";
        var audience = _configuration["Jwt:Audience"] ?? "SafeHarbor";
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
        var jwtToken = new JwtSecurityToken(
            issuer, audience,
            claims: [new Claim("mfa_pending", "true"), new Claim(ClaimTypes.NameIdentifier, userId)],
            expires: DateTime.UtcNow.AddMinutes(5),
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(jwtToken);
    }

    // Validates the cookie JWT and returns the user ID, or null if invalid/expired.
    private string? ValidateMfaPendingToken(string tokenString)
    {
        var key = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key missing");
        var issuer = _configuration["Jwt:Issuer"] ?? "SafeHarbor";
        var audience = _configuration["Jwt:Audience"] ?? "SafeHarbor";
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var principal = handler.ValidateToken(tokenString, new TokenValidationParameters
            {
                ValidateIssuer = true, ValidIssuer = issuer,
                ValidateAudience = true, ValidAudience = audience,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            }, out _);

            if (principal.FindFirstValue("mfa_pending") != "true") return null;
            return principal.FindFirstValue(ClaimTypes.NameIdentifier);
        }
        catch { return null; }
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
