<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Hash;
use Validator;

use App\Listener;
use App\Models\Admins;
use App\Models\Allergens;
use App\Models\Appliances;
use App\Models\Availabilities;
use App\Models\Categories;
use App\Models\Conversations;
use App\Models\Customizations;
use App\Models\Meals;
use App\Models\Menus;
use App\Models\Orders;
use App\Models\Reviews;
use App\Models\Tickets;
use App\Models\Transactions;
use App\Models\NotificationTemplates;
use App\Models\PaymentMethodListener;
use App\Notification;
use Illuminate\Support\Str;
use DB;
//require 'api/vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\Reader\Xlsx; 
use Kreait\Laravel\Firebase\Facades\Firebase;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Exception\FirebaseException;


class AdminapiController extends Controller
{
    protected $request; // request as an attribute of the controllers
    protected $notification; // Push Notification

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->notification = Firebase::messaging();
    }

    private function notification($token, $title, $body, $role)
    {
        $message = CloudMessage::fromArray([
            'token' => $token,
            'notification' => [
                'title' => $title,
                'body' => $body,
                'role' => $role
            ]
        ]);

        $this->notification->send($message);
    }

    public function resetPassword(Request $request) {
        $auser = app(Admins::class)->where(['id'=>$request->id])->first();
        if (isset($request->oldpassword)) {
            if (Hash::check($request->oldpassword, $auser->password)) {
                app(Admins::class)->where(['id'=>$request->id])->update(['password'=>bcrypt($request->password)]);
                return response()->json(['success' => 1]);
            } else {
                return response()->json(['success' => 0, 'error'=>"Current password doesn't match."]);
            }
        } else {
            app(Admins::class)->where(['id'=>$request->id])->update(['password'=>bcrypt($request->password)]);
            return response()->json(['success' => 1]);
        }
    }
    
    public function changeChefStatus(Request $request) {
        $ids = explode(',', $request->ids);
        $auser = app(Listener::class)->whereIn('id',$ids)->get();
        if (isset($auser)) {
            if ($request->status == 0) {
                app(Listener::class)->whereIn('id',$ids)->update(['is_pending'=>1]);
            } else {
                if ($request->status == 4) {
                    app(Listener::class)->whereIn('id',$ids)->delete();
                } else {
                    app(Listener::class)->whereIn('id',$ids)->update(['verified'=>$request->status, 'is_pending'=>0]);
                    if ($request->status == 1) {
                        foreach($ids as $uid) {
                            $approved_user = app(Listener::class)->where('id',$uid)->first();
                            if ($approved_user->fcm_token) {
                                $notification = app(NotificationTemplates::class)->where(['id'=>1])->first();
                                try {
                                    $this->notification($approved_user->fcm_token, $notification->subject, $notification->push, $role = 'chef');
                                    Notification::create([
                                        'title' => $notification->template_name,
                                        'body' => $notification->push,
                                        'image' => $approved_user->photo ?? 'N/A',
                                        'fcm_token' => $approved_user->fcm_token,
                                        'user_id' => $approved_user->id,
                                        'navigation_id' => $approved_user->id,
                                        'role' => $role,
                                    ]);
                                }  catch(FirebaseException $e) {
                                    $errorMsg = $e->getMessage();
                                }
                            }
                        }
                    }
                }
            }
            return response()->json(['success' => 1]);
        } else {
            return response()->json(['success' => 0, 'error'=>"No chef user with the provided ID."]);
        }
    }

    public function changeTicketStatus(Request $request) {
        $ids = explode(',', $request->ids);
        $tickets = app(Tickets::class)->whereIn('id',$ids)->get();
        if (isset($tickets)) {
            app(Tickets::class)->whereIn('id',$ids)->update(['status'=>$request->status]);
            return response()->json(['success' => 1]);
        } else {
            return response()->json(['success' => 0, 'error'=>"No ticket with the provided ID."]);
        }
    }
    
    public function changeCategoryStatus(Request $request) {
        $ids = explode(',', $request->ids);
        $tickets = app(Categories::class)->whereIn('id',$ids)->get();
        if (isset($tickets)) {
            app(Categories::class)->whereIn('id',$ids)->update(['status'=>$request->status]);
            return response()->json(['success' => 1]);
        } else {
            return response()->json(['success' => 0, 'error'=>"No category with the provided ID."]);
        }
    }

    public function deleteStripeAccounts(Request $request)
    {
        include $_SERVER['DOCUMENT_ROOT'] . '/include/config.php';
        require_once('../stripe-php/init.php');

        $ids = explode(',', $request->input('ids'));

        if (empty($ids)) {
            return response()->json(['error' => 'No IDs provided.'], 400);
        }

        $chefs = PaymentMethodListener::query()
            ->join('tbl_users', 'tbl_payment_method_listener.user_id', '=', 'tbl_users.id')
            ->whereIn('tbl_payment_method_listener.user_id', $ids)
            ->whereNotNull('tbl_users.email')
            ->select(
                'tbl_payment_method_listener.*',
                'tbl_users.email'
            )
            ->get();



        $stripe = new \Stripe\StripeClient($stripe_key);

        foreach ($chefs as $chef) {
            try {
                $accounts = $stripe->accounts->all(['limit' => 100]);

                foreach ($accounts->data as $account) {
                    if (isset($account->email) && strtolower($account->email) === strtolower($chef->email)) {
                        
                        $disabledReason = $account->requirements['disabled_reason'] ?? null;
                        $accountStatus = $account->status ?? null;

                        if (!empty($disabledReason) || $accountStatus === 'rejected') {
                            \Log::info("Deleting account {$account->id} for email {$chef->email} — Status: " . ($disabledReason ?? $accountStatus));
                            $stripe->accounts->delete($account->id, []);
                        }
                    }
                }

            } catch (\Exception $e) {
                \Log::error("Failed to delete Stripe account for chef email {$chef->email}: " . $e->getMessage());
                continue;
            }
        }

        return response()->json(['message' => 'Stripe accounts deleted where applicable.']);
    }


}