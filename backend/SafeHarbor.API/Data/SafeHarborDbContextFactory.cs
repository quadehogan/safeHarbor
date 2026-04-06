using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace SafeHarbor.API.Data;

public class SafeHarborDbContextFactory : IDesignTimeDbContextFactory<SafeHarborDbContext>
{
    public SafeHarborDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<SafeHarborDbContext>();
        optionsBuilder.UseNpgsql(
            "Host=localhost;Database=safeharbor;Username=postgres;Password=postgres");
        return new SafeHarborDbContext(optionsBuilder.Options);
    }
}
