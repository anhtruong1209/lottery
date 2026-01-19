using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data
{
    public class LotteryDbContext : DbContext
    {
        public LotteryDbContext(DbContextOptions<LotteryDbContext> options) : base(options)
        {
        }

        public DbSet<Participant> Participants { get; set; }
        public DbSet<Winner> Winners { get; set; }
        public DbSet<DrawConfig> DrawConfigs { get; set; }
        public DbSet<CheckIn> CheckIns { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<AppSetting> AppSettings { get; set; }
        public DbSet<Department> Departments { get; set; }

        // V2 Tables
        public DbSet<AppSetting2> AppSettings2 { get; set; }
        public DbSet<Participant2> Participants2 { get; set; }
        public DbSet<DrawConfig2> DrawConfigs2 { get; set; }
        public DbSet<Winner2> Winners2 { get; set; }
        public DbSet<CheckIn2> CheckIns2 { get; set; }
        public DbSet<User2> Users2 { get; set; }
        public DbSet<Department2> Departments2 { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // PostgreSQL uses lowercase table names with underscores by convention
            modelBuilder.Entity<Participant>().ToTable("participants");
            modelBuilder.Entity<Winner>().ToTable("winners");
            modelBuilder.Entity<DrawConfig>().ToTable("draw_configs");
            modelBuilder.Entity<CheckIn>().ToTable("check_ins");
            modelBuilder.Entity<User>().ToTable("users");

            // Configure Participant
            modelBuilder.Entity<Participant>(entity =>
            {
                entity.Property(p => p.Id).HasColumnName("id");
                entity.Property(p => p.Name).HasColumnName("name");
                entity.Property(p => p.Department).HasColumnName("department");
                entity.Property(p => p.CreatedAt).HasColumnName("created_at");
                entity.Property(p => p.UpdatedAt).HasColumnName("updated_at");
                
                entity.HasIndex(p => new { p.Name, p.Department });
            });

            // Configure Winner
            modelBuilder.Entity<Winner>(entity =>
            {
                entity.Property(w => w.Id).HasColumnName("id");
                entity.Property(w => w.ParticipantId).HasColumnName("participant_id");
                entity.Property(w => w.DrawConfigId).HasColumnName("draw_config_id");
                entity.Property(w => w.WonAt).HasColumnName("won_at");

                entity.HasOne(w => w.Participant)
                      .WithMany()
                      .HasForeignKey(w => w.ParticipantId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(w => w.DrawConfig)
                      .WithMany()
                      .HasForeignKey(w => w.DrawConfigId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure DrawConfig
            modelBuilder.Entity<DrawConfig>(entity =>
            {
                entity.Property(d => d.Id).HasColumnName("id");
                entity.Property(d => d.Label).HasColumnName("label");
                entity.Property(d => d.Count).HasColumnName("count");
                entity.Property(d => d.PrizeName).HasColumnName("prize_name");
                entity.Property(d => d.DisplayOrder).HasColumnName("display_order");
            });

            // Configure CheckIn
            modelBuilder.Entity<CheckIn>(entity =>
            {
                entity.Property(c => c.Id).HasColumnName("id");
                entity.Property(c => c.ParticipantId).HasColumnName("participant_id");
                entity.Property(c => c.DeviceFingerprint).HasColumnName("device_fingerprint");
                entity.Property(c => c.CheckedInAt).HasColumnName("checked_in_at");
                entity.Property(c => c.IPAddress).HasColumnName("ip_address");
                entity.Property(c => c.UserAgent).HasColumnName("user_agent");

                entity.HasOne(c => c.Participant)
                      .WithMany()
                      .HasForeignKey(c => c.ParticipantId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(c => new { c.ParticipantId, c.DeviceFingerprint });
            });

            // Configure User
            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(u => u.Id).HasColumnName("id");
                entity.Property(u => u.Username).HasColumnName("username");
                entity.Property(u => u.PasswordHash).HasColumnName("password_hash");
                entity.Property(u => u.Role).HasColumnName("role");
                entity.Property(u => u.CreatedAt).HasColumnName("created_at");

                entity.HasIndex(u => u.Username).IsUnique();
            });

            // Configure AppSetting
            modelBuilder.Entity<AppSetting>(entity =>
            {
                entity.ToTable("app_settings");
                entity.Property(a => a.Id).HasColumnName("id");
                entity.Property(a => a.SettingKey).HasColumnName("setting_key");
                entity.Property(a => a.SettingValue).HasColumnName("setting_value").HasColumnType("nvarchar(max)");
                entity.Property(a => a.SettingType).HasColumnName("setting_type");
                entity.Property(a => a.Description).HasColumnName("description");
                entity.Property(a => a.UpdatedAt).HasColumnName("updated_at");
                entity.Property(a => a.UpdatedBy).HasColumnName("updated_by");

                entity.HasIndex(a => a.SettingKey).IsUnique();
            });

            // Configure AppSetting2 for V2
            modelBuilder.Entity<AppSetting2>(entity =>
            {
                entity.ToTable("app_settings_2");
                entity.Property(e => e.SettingValue).HasColumnType("nvarchar(max)");
            });

            // Configure Department
            modelBuilder.Entity<Department>(entity =>
            {
                entity.ToTable("departments");
                entity.Property(d => d.Id).HasColumnName("id");
                entity.Property(d => d.Name).HasColumnName("name");
                entity.Property(d => d.CreatedAt).HasColumnName("created_at");
                
                entity.HasIndex(d => d.Name).IsUnique();
            });

            // Note: Seed data is now in the SQL migration script
            // The draw_configs are seeded directly in Supabase
        }
    }
}
