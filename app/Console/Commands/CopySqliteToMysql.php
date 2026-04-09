<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CopySqliteToMysql extends Command
{
    protected $signature = 'db:copy-sqlite-to-mysql
        {--from=sqlite : Source connection name (default: sqlite)}
        {--to=mysql : Target connection name (default: mysql)}
        {--chunk=1000 : Chunk size for copying rows}
        {--fresh : Truncate target tables before inserting}
        {--force : Do not prompt for confirmation}';

    protected $description = 'Copy data from SQLite to MySQL (table-by-table) using two database connections.';

    public function handle(): int
    {
        $from = (string) $this->option('from');
        $to = (string) $this->option('to');
        $chunkSize = max(1, (int) $this->option('chunk'));
        $fresh = (bool) $this->option('fresh');
        $force = (bool) $this->option('force');

        if ($from === $to) {
            $this->error('Source and target connections must be different.');
            return self::FAILURE;
        }

        try {
            DB::connection($from)->getPdo();
        } catch (\Throwable $e) {
            $this->error("Cannot connect to source connection '{$from}': {$e->getMessage()}");
            return self::FAILURE;
        }

        try {
            DB::connection($to)->getPdo();
        } catch (\Throwable $e) {
            $this->error("Cannot connect to target connection '{$to}': {$e->getMessage()}");
            return self::FAILURE;
        }

        $this->info("Copying data: {$from} → {$to}");
        $this->line('Make sure you have run migrations on the target database first.');

        if (! $force) {
            if (! $this->confirm('Proceed? This may overwrite/duplicate data if you run it twice.', false)) {
                $this->warn('Aborted.');
                return self::SUCCESS;
            }
        }

        $sourceTables = $this->listTables($from);
        if (empty($sourceTables)) {
            $this->warn('No tables found in source database.');
            return self::SUCCESS;
        }

        $targetTables = $this->listTables($to);
        $tables = array_values(array_intersect($sourceTables, $targetTables));

        if (empty($tables)) {
            $this->error('No common tables found between source and target.');
            return self::FAILURE;
        }

        $ignored = ['migrations'];
        $tables = array_values(array_filter($tables, fn ($t) => ! in_array($t, $ignored, true)));

        if (empty($tables)) {
            $this->warn('No tables to copy (after ignoring tables).');
            return self::SUCCESS;
        }

        if ($fresh) {
            if (! $force) {
                if (! $this->confirm("Truncate target tables on connection '{$to}' before copying?", false)) {
                    $this->warn('Aborted.');
                    return self::SUCCESS;
                }
            }

            DB::connection($to)->statement('SET FOREIGN_KEY_CHECKS=0');
            foreach ($tables as $table) {
                DB::connection($to)->table($table)->truncate();
            }
            DB::connection($to)->statement('SET FOREIGN_KEY_CHECKS=1');
        }

        $bar = $this->output->createProgressBar(count($tables));
        $bar->start();

        $this->setForeignKeyChecks($to, false);

        try {
            foreach ($tables as $table) {
                $this->copyTable($from, $to, $table, $chunkSize);
                $bar->advance();
            }
        } finally {
            $this->setForeignKeyChecks($to, true);
        }

        $bar->finish();
        $this->newLine();
        $this->info('Done.');

        return self::SUCCESS;
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

            return array_values(array_map(fn ($r) => (string) $r->name, $rows));
        }

        // MySQL / MariaDB
        $databaseName = DB::connection($connection)->getDatabaseName();
        $rows = DB::connection($connection)
            ->select('SELECT table_name AS name FROM information_schema.tables WHERE table_schema = ?', [$databaseName]);

        return array_values(array_map(fn ($r) => (string) $r->name, $rows));
    }

    private function copyTable(string $from, string $to, string $table, int $chunkSize): void
    {
        if (! Schema::connection($from)->hasTable($table) || ! Schema::connection($to)->hasTable($table)) {
            return;
        }

        $sourceColumns = Schema::connection($from)->getColumnListing($table);
        $targetColumns = Schema::connection($to)->getColumnListing($table);
        $columns = array_values(array_intersect($sourceColumns, $targetColumns));

        if (empty($columns)) {
            $this->warn("Skipping {$table}: no common columns.");
            return;
        }

        $sourceQuery = DB::connection($from)->table($table)->select($columns);

        // Prefer chunkById when possible.
        if (in_array('id', $columns, true)) {
            $sourceQuery->orderBy('id')->chunkById($chunkSize, function ($rows) use ($to, $table) {
                $payload = $rows->map(fn ($r) => (array) $r)->all();
                if (! empty($payload)) {
                    DB::connection($to)->table($table)->insert($payload);
                }
            }, 'id');

            return;
        }

        // Fallback: chunk with offset using a stable order.
        $orderColumn = $columns[0];
        $sourceQuery->orderBy($orderColumn)->chunk($chunkSize, function ($rows) use ($to, $table) {
            $payload = $rows->map(fn ($r) => (array) $r)->all();
            if (! empty($payload)) {
                DB::connection($to)->table($table)->insert($payload);
            }
        });
    }

    private function setForeignKeyChecks(string $connection, bool $enabled): void
    {
        $driver = DB::connection($connection)->getDriverName();
        if (! in_array($driver, ['mysql', 'mariadb'], true)) {
            return;
        }

        try {
            DB::connection($connection)->statement('SET FOREIGN_KEY_CHECKS='.($enabled ? '1' : '0'));
        } catch (\Throwable) {
            // ignore
        }
    }
}
