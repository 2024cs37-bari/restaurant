<?php

namespace Zerp\Restaurant\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        // Hook point for later slices (order events, kitchen routing, stock deduction).
    ];
}
