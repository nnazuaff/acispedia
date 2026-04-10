<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ResetAppData extends Command
{
    protected $signature = 'data:reset
        {--keep=* : Tables to keep (default: users; migrations always kept)}
        {--connection= : Database connection name (default: current)}
        {--force : Do not prompt for confirmation}';

    protected $description = 'Delete all application data while keeping user accounts.';

    public function handle(): int
    {
        $connection = (string) ($this->option('connection') ?: config('database.default'));
        $force = (bool) $this->option('force');

        try {
            DB::connection($connection)->getPdo();
        } catch (\Throwable $e) {
            $this->error("Cannot connect to database connection '{$connection}': {$e->getMessage()}");

            return self::FAILURE;
        }

        $keep = $this->normalizeKeepTables($this->option('keep'));
        $tables = $this->listTables($connection);

        if ($tables === []) {
            $this->warn('No tables found.');

            return self::SUCCESS;
        }

        $targets = array_values(array_filter($tables, fn (string $t) => ! in_array(strtolower($t), $keep, true)));

        if ($targets === []) {
            $this->info('Nothing to reset (all tables are in the keep list).');

            return self::SUCCESS;
        }

        $this->warn('You are about to DELETE data from these tables:');
        $this->line(implode(', ', $targets));
        $this->newLine();
        $this->info('Kept tables: '.implode(', ', $keep));

        if (! $force) {
            if (app()->environment('production')) {
                $this->warn('Production environment detected.');
            }

            if (! $this->confirm('Proceed? This cannot be undone.', false)) {
                $this->warn('Aborted.');

                return self::SUCCESS;
            }
        }

        $this->setForeignKeyChecks($connection, false);

        $ok = 0;
        $failed = 0;

        try {
            foreach ($targets as $table) {
                try {
                    DB::connection($connection)->table($table)->truncate();
                    $ok++;
                } catch (\Throwable $e) {
                    $failed++;
                    $this->warn("Failed to truncate '{$table}': {$e->getMessage()}");
                }
            }
        } finally {
            $this->setForeignKeyChecks($connection, true);
        }

        $this->info("Done. Truncated: {$ok} table(s). Failed: {$failed}.");

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }

    /**
     * @param  mixed  $raw
     * @return array<int, string>
     */
    private function normalizeKeepTables(mixed $raw): array
    {
        $keep = [];
        if (is_array($raw)) {
            $keep = $raw;
        } elseif (is_string($raw) && trim($raw) !== '') {
            $keep = [$raw];
        }

        $keep = array_values(array_filter(array_map(static fn ($v) => strtolower(trim((string) $v)), $keep), static fn ($v) => $v !== ''));

        // Always keep migrations to avoid breaking future artisan/migrate behavior.
        $keep = array_values(array_unique(array_merge(['migrations'], $keep)));

        // Default: keep user accounts.
        if (! in_array('users', $keep, true)) {
            $keep[] = 'users';
        }

        sort($keep);

        return $keep;
    }

    /**
     * @return array<int, string>
     */
    private function listTables(string $connection): array
    {
        $driver = DB::connection($connection)->getDriverName();

        if ($driver === 'sqlite') {
            $rows = DB::connection($connection)
                ->select("select name from sqlite_master where type='table' and name not like 'sqlite_%'");

            return array_values(array_map(static fn ($r) => (string) $r->name, $rows));
        }

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            $databaseName = DB::connection($connection)->getDatabaseName();
            $rows = DB::connection($connection)
                ->select('SELECT table_name AS name FROM information_schema.tables WHERE table_schema = ?', [$databaseName]);

            return array_values(array_map(static fn ($r) => (string) $r->name, $rows));
        }

        if ($driver === 'pgsql') {
            $rows = DB::connection($connection)
                ->select("select tablename as name from pg_tables where schemaname = 'public'");

            return array_values(array_map(static fn ($r) => (string) $r->name, $rows));
        }

        $this->warn("Unsupported driver '{$driver}'. Falling back to empty table list.");

        return [];
    }

    private function setForeignKeyChecks(string $connection, bool $enabled): void
    {
        $driver = DB::connection($connection)->getDriverName();

        try {
            if (in_array($driver, ['mysql', 'mariadb'], true)) {
                DB::connection($connection)->statement('SET FOREIGN_KEY_CHECKS='.($enabled ? '1' : '0'));
            } elseif ($driver === 'sqlite') {
                DB::connection($connection)->statement('PRAGMA foreign_keys = '.($enabled ? 'ON' : 'OFF'));
            } elseif ($driver === 'pgsql') {
                // Best-effort only; TRUNCATE should work with CASCADE if needed, but we disable checks when possible.
                DB::connection($connection)->statement("SET session_replication_role = '".($enabled ? 'origin' : 'replica')."'");
            }
        } catch (\Throwable) {
            // ignore
        }
    }
}
