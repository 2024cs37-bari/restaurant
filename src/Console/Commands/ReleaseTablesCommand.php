<?php

namespace Zerp\Restaurant\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Zerp\Restaurant\Models\Reservation;
use Zerp\Restaurant\Models\RestaurantTable;

class ReleaseTablesCommand extends Command
{
    protected $signature = 'restaurant:release-tables';

    protected $description = 'Free reserved tables whose booking passed its grace period (marks the reservation no-show).';

    // Grace after the reserved time before a no-show auto-releases the table.
    // ponytail: fixed 30m; make it a per-tenant setting only if someone asks.
    private const GRACE_MINUTES = 30;

    public function handle(): int
    {
        $cutoff = Carbon::now()->subMinutes(self::GRACE_MINUTES);

        // Reservation-driven and safe: only touches tables still in 'reserved'
        // state (never a 'seated'/occupied table).
        $stale = Reservation::where('status', 'booked')
            ->whereNotNull('restaurant_table_id')
            ->where('reserved_at', '<', $cutoff)
            ->get();

        $released = 0;
        foreach ($stale as $reservation) {
            $reservation->update(['status' => 'no_show']);
            $freed = RestaurantTable::where('id', $reservation->restaurant_table_id)
                ->where('status', 'reserved')
                ->update(['status' => 'free']);
            $released += $freed;
        }

        $this->info("Released {$released} table(s) from {$stale->count()} stale reservation(s).");

        return self::SUCCESS;
    }
}
