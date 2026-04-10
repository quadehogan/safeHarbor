namespace SafeHarbor.API.Models;

public class LoginRequest
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
}

public class RegisterRequest
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string? Role { get; set; }
}

public class AuthResponse
{
    public string Token { get; set; } = "";
    public string Email { get; set; } = "";
    public IList<string> Roles { get; set; } = [];
}

// MFA: request body for /api/auth/mfa-verify (completes login with a TOTP code)
public class MfaVerifyRequest
{
    public string Code { get; set; } = "";
}

// MFA: request body for POST /api/auth/mfa-setup (confirms setup and enables 2FA)
public class MfaSetupRequest
{
    public string Code { get; set; } = "";
}
