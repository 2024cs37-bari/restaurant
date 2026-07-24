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

        $apiRoutesPath = __DIR__.'/../Routes/api.php';
        if (file_exists($apiRoutesPath)) {
            $this->loadRoutesFrom($apiRoutesPath);
        }

        // Scoped Swagger/OpenAPI docs for this module at /docs/restaurant.
        if (class_exists(\Dedoc\Scramble\Scramble::class)) {
            \Dedoc\Scramble\Scramble::registerApi('restaurant', [
                'api_path' => 'api/restaurant',
                'info' => ['version' => \Composer\InstalledVersions::getPrettyVersion('zerp/restaurant') ?? '1.0.0', 'description' => 'Zerp Restaurant module REST API for mobile and third-party clients.'],
                'ui' => ['title' => 'Zerp Restaurant API'],
            ])->expose(ui: '/docs/restaurant', document: '/docs/restaurant.json');
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
