<?php

namespace Zerp\Restaurant\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Zerp\Restaurant\Http\Requests\StoreReservationRequest;
use Zerp\Restaurant\Http\Requests\UpdateReservationRequest;
use Zerp\Restaurant\Models\Reservation;
use Zerp\Restaurant\Models\RestaurantTable;

class ReservationController extends Controller
{
    private function owns(Reservation $reservation): bool
    {
        return $reservation->created_by == creatorId();
    }

    public function index()
    {
        if (!Auth::user()->can('manage-reservations')) {
            return back()->with('error', __('Permission denied'));
        }

        return Inertia::render('Restaurant/Reservations/Index', [
            'reservations' => Reservation::where('created_by', creatorId())
                ->with('table:id,name')->orderBy('reserved_at')->get(),
            'tables' => RestaurantTable::where('created_by', creatorId())
                ->orderBy('name')->get(['id', 'name', 'seats']),
        ]);
    }

    public function store(StoreReservationRequest $request)
    {
        if (!Auth::user()->can('create-reservations')) {
            return back()->with('error', __('Permission denied'));
        }
        $validated = $request->validated();

        Reservation::create($validated + [
            'status' => 'booked',
            'creator_id' => Auth::id(),
            'created_by' => creatorId(),
        ]);

        return back()->with('success', __('The reservation has been created successfully.'));
    }

    public function update(UpdateReservationRequest $request, Reservation $reservation)
    {
        if (!Auth::user()->can('edit-reservations') || !$this->owns($reservation)) {
            return back()->with('error', __('Permission denied'));
        }

        $reservation->update($request->validated());

        return back()->with('success', __('The reservation has been updated successfully.'));
    }

    public function destroy(Reservation $reservation)
    {
        if (!Auth::user()->can('delete-reservations') || !$this->owns($reservation)) {
            return back()->with('error', __('Permission denied'));
        }

        $reservation->delete();

        return back()->with('success', __('The reservation has been deleted.'));
    }

    public function seat(Reservation $reservation)
    {
        if (!Auth::user()->can('edit-reservations') || !$this->owns($reservation)) {
            return back()->with('error', __('Permission denied'));
        }
        if (!$reservation->restaurant_table_id) {
            return back()->with('error', __('Assign a table to this reservation before seating.'));
        }

        $reservation->update(['status' => 'seated']);
        // Seating a reservation occupies its table - the join point orders will use.
        RestaurantTable::where('id', $reservation->restaurant_table_id)
            ->where('created_by', creatorId())
            ->update(['status' => 'seated']);

        return back()->with('success', __('The party has been seated.'));
    }

    public function cancel(Reservation $reservation)
    {
        if (!Auth::user()->can('edit-reservations') || !$this->owns($reservation)) {
            return back()->with('error', __('Permission denied'));
        }

        $reservation->update(['status' => 'cancelled']);

        return back()->with('success', __('The reservation has been cancelled.'));
    }

    public function noShow(Reservation $reservation)
    {
        if (!Auth::user()->can('edit-reservations') || !$this->owns($reservation)) {
            return back()->with('error', __('Permission denied'));
        }

        $reservation->update(['status' => 'no_show']);

        return back()->with('success', __('Marked as no-show.'));
    }
}
