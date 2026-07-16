<?php

namespace Zerp\Restaurant\Support;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Zerp\Restaurant\Models\Order;

/**
 * Posts a settled restaurant order's total as revenue into the account module,
 * reusing that module's own JournalService / BankTransactionsService so the
 * double-entry journal + bank transaction match how the accounting module does it.
 *
 * Degrades gracefully: if the account module isn't installed, or the tenant's
 * chart of accounts isn't set up (no bank GL account / no revenue category with a
 * GL account), it records nothing and returns a reason - settlement is never blocked.
 *
 * @return array{posted: bool, reason?: string, revenue_id?: int}
 */
class RevenuePoster
{
    public static function post(Order $order): array
    {
        if (!class_exists(\Zerp\Account\Models\Revenue::class)) {
            return ['posted' => false, 'reason' => 'Accounting module is not installed.'];
        }
        if (!$order->bank_account_id) {
            return ['posted' => false, 'reason' => 'No deposit account was selected.'];
        }

        try {
            $bank = \Zerp\Account\Models\BankAccount::where('id', $order->bank_account_id)
                ->where('created_by', creatorId())->first();
            if (!$bank || !$bank->gl_account_id) {
                return ['posted' => false, 'reason' => 'The selected account has no GL account assigned.'];
            }

            // Reuse an existing revenue category that has a GL account (prefer one
            // that looks restaurant/sales related). We never fabricate a chart of
            // accounts - that's the tenant's accounting setup.
            $category = \Zerp\Account\Models\RevenueCategories::where('created_by', creatorId())
                ->whereNotNull('gl_account_id')
                ->orderByRaw("(category_name LIKE '%Restaurant%' OR category_name LIKE '%Sales%') DESC")
                ->first();
            if (!$category) {
                return ['posted' => false, 'reason' => 'No revenue category with a GL account is configured in Accounting.'];
            }

            $revenue = new \Zerp\Account\Models\Revenue();
            $revenue->revenue_date = now()->toDateString();
            $revenue->category_id = $category->id;
            $revenue->bank_account_id = $bank->id;
            $revenue->chart_of_account_id = $category->gl_account_id;
            $revenue->amount = $order->total;
            $revenue->description = 'Restaurant order ' . $order->order_number;
            $revenue->reference_number = $order->order_number;
            $revenue->status = 'draft';
            $revenue->creator_id = Auth::id();
            $revenue->created_by = creatorId();
            $revenue->save();

            app(\Zerp\Account\Services\JournalService::class)->createRevenueEntryJournal($revenue);
            app(\Zerp\Account\Services\BankTransactionsService::class)->createRevenuePayment($revenue);
            $revenue->update(['status' => 'posted']);

            return ['posted' => true, 'revenue_id' => $revenue->id];
        } catch (\Throwable $e) {
            Log::warning('Restaurant revenue posting failed for order ' . $order->order_number . ': ' . $e->getMessage());
            return ['posted' => false, 'reason' => 'Accounting posting failed: ' . $e->getMessage()];
        }
    }
}
