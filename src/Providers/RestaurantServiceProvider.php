<?php

namespace Zerp\Restaurant\Providers;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\ServiceProvider;
use Zerp\Restaurant\Console\Commands\ReleaseTablesCommand;

class RestaurantServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $routesPath = __DIR__.'/../Routes/web.php';
        if (file_exists($routesPath)) {
            $this->loadRoutesFrom($routesPath);
        }

        $migrationsPath = __DIR__.'/../Database/Migrations';
        if (is_dir($migrationsPath)) {
            $this->loadMigrationsFrom($migrationsPath);
        }

        if ($this->app->runningInConsole()) {
            $this->commands([ReleaseTablesCommand::class]);

            // Auto-release stale reserved tables every 5 minutes.
            $this->app->booted(function () {
                $this->app->make(Schedule::class)->command('restaurant:release-tables')->everyFiveMinutes();
            });
        }
    }

    public function register(): void
    {
        $this->app->register(EventServiceProvider::class);
    }
}
