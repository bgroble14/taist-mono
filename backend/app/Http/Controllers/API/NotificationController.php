<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Listener;
use App\Notification;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    public function getNotificationById(Request $request, $id) 
    {
        try {
            $notifications = Notification::where('user_id', $id)->orderBy('id', 'desc')->get();

            $formattedNotifications = $notifications->map(function ($notification) {
                if ($notification->title === 'Review and tip for Chef' || $notification->title === 'Review for chef') {
                    $review = json_decode($notification->body, true);
                    return [
                        'id' => $notification->id,
                        'title' => $notification->title,
                        'tip' => $review['tip'], 
                        'review' => $review['review'], 
                        'ratings' => $review['ratings'],
                        'navigation_id' => $notification->navigation_id,
                        'fcm_token' => $notification->fcm_token,
                        'role' => $notification->role,
                        'user_id' => $notification->user_id,
                        'image' => $notification->image,
                        'updated_at' => $notification->updateed_at,
                        'created_at' => $notification->created_at,
                    ];
                }

                return $notification;
            });

            return response()->json(['success' => true, 'data' => $formattedNotifications]);

        } catch (Exception $e) {
            $errorMsg = "Unable to get notification: " . $e->getMessage();
            return response()->json(['success' => false, 'error' => $errorMsg]);
        }
    }

    public function getChefsWithDistance($customerLatitude, $customerLongitude, $radius = 20) {
        $chefs = DB::table('users')
            ->select(
                'users.*',
                DB::raw("(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance")
            )
            ->where('user_type', 2)
            ->having('distance', '<=', $radius)
            ->setBindings([$customerLatitude, $customerLongitude, $customerLatitude]) // Prevent SQL injection
            ->orderBy('distance', 'asc') 
            ->get();
    
        return $chefs;
    }


    public function getCustomerChefs(Request $request, $id)
    {
        $customer = Listener::where('id', $id)->first();
        $radius = 20;

        $chefsWithDistance = $this->getChefsWithDistance($customer->latitude, $customer->longitude, $radius);

        return response()->json([
            'success' => true,
            'data' => $chefsWithDistance
        ]);
    }


}
