<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use DB;

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
use App\Models\Zipcodes;

require_once('api/SimpleXLSXGen.php');
use SimpleXLSXGen;

class AdminController extends Controller
{
    private $limit = 10;
    protected function guard() {
        return Auth::guard('admin');
    }
    
    private function _getFormattedData($data) {
        foreach ($data as &$aa) {
            if (isset($aa->updated_at) && strlen($aa->updated_at) > 10)
                $aa->updated_at = strtotime($aa->updated_at);
            if (isset($aa->created_at) && strlen($aa->created_at) > 10)
                $aa->created_at = strtotime($aa->created_at);
            if (isset($aa->invited_at) && strlen($aa->invited_at) > 10)
                $aa->invited_at = strtotime($aa->invited_at);
        }
        return $data;
    }

    private static function getUserStatus($st) {
        if ($st == 1)
            return "Active";
        else if ($st == 0)
            return "Pending";
        else if ($st == 2)
            return "Rejected";
        else if ($st == 3)
            return "Banned";
        else 
            return "None";
    }

    private static function getOrderStatus($st) {
        if ($st == 1)
            return "Requested";
        else if ($st == 2)
            return "Accepted";
        else if ($st == 3)
            return "Completed";
        else if ($st == 4)
            return "Cancelled";
        else if ($st == 5)
            return "Rejected";
        else if ($st == 6)
            return "Expired";
        else if ($st == 7)
            return "On My Way";
        else 
            return "None";
    }

    public function index(Request $request) {
        $data['title'] = "Taist - Admin Panel";
        $user = $this->guard()->user();
        $data['user'] = $user;

        return view("admin.chefs", $data);
    }

    public function chefs(Request $request) {
        $data['title'] = "Taist - Admin Panel";
        $user = $this->guard()->user();
        $data['user'] = $user;
        //$data['chefs'] = app(Listener::class)->where(['user_type'=>2, 'is_pending'=>0])->get();
        $data['chefs'] = app(Listener::class)->where(['user_type'=>2])->get();

        return view("admin.chefs", $data);
    }

    public function pendings(Request $request) {
        $data['title'] = "Taist - Admin Panel";
        $user = $this->guard()->user();
        $data['user'] = $user;
        $data['pendings'] = app(Listener::class)->where(['user_type'=>2, 'is_pending'=>1])->get();

        return view("admin.pendings", $data);
    }

    public function categories(Request $request) {
        $data['title'] = "Taist - Admin Panel";
        $user = $this->guard()->user();
        $data['user'] = $user;
        $data['categories'] = DB::table('tbl_categories as c')->leftJoin('tbl_users as u', 'c.chef_id', '=', 'u.id')
            ->select(['c.*', 'u.email as user_email'])->get();

        return view("admin.categories", $data);
    }

    public function menus(Request $request) {
        $data['title'] = "Taist - Admin Panel";
        $user = $this->guard()->user();
        $data['user'] = $user;
        $data['menus'] = DB::table('tbl_menus as m')
            ->leftJoin('tbl_users as u', 'm.user_id', '=', 'u.id')
            //->leftJoin('tbl_categories as c', 'm.category_id', '=', 'c.id')
            ->select(['m.*', 'u.email as user_email', 'u.first_name as user_first_name', 'u.last_name as user_last_name', 'u.photo as user_photo'])
            ->groupBy('m.id', 'm.allergens', 'm.appliances')->get();

        foreach ($data['menus'] as &$a) {
            $a->category_list = app(Categories::class)->whereRaw('FIND_IN_SET(id, "'.$a->category_ids.'") > 0')->selectRaw('GROUP_CONCAT(name) as title')->first();
            $a->allergen_list = app(Allergens::class)->whereRaw('FIND_IN_SET(id, "'.$a->allergens.'") > 0')->selectRaw('GROUP_CONCAT(name) as title')->first();
            $a->appliance_list = app(Appliances::class)->whereRaw('FIND_IN_SET(id, "'.$a->appliances.'") > 0')->selectRaw('GROUP_CONCAT(name) as title')->first();
        }

        return view("admin.menus", $data);
    }

    public function editMenu(Request $request, $id) {
        $data['title'] = "Taist - Admin Panel";
        $user = $this->guard()->user();
        $data['user'] = $user;
        $data['menu'] = app(Menus::class)->where(['id'=>$id])->first();

        return view("admin.menus_edit", $data);
    }

    public function updateMenu(Request $request, $id) {
        app(Menus::class)->where(['id'=>$id])->update(['title'=>$request->title, 'description'=>$request->description, 'updated_at'=>time()]);

        return redirect()->to('/admin/menus');
    }

    public function customizations(Request $request) {
        $data['title'] = "Taist - Admin Panel";
        $user = $this->guard()->user();
        $data['user'] = $user;
        $data['customizations'] = DB::table('tbl_customizations as c')->leftJoin('tbl_menus as m', 'm.id', '=', 'c.menu_id')
            ->select(['c.*', 'm.title as menu_title'])->get();

        return view("admin.customizations", $data);
    }

    public function editCustomizations(Request $request, $id) {
        $data['title'] = "Taist - Admin Panel";
        $user = $this->guard()->user();
        $data['user'] = $user;
        $data['customization'] = app(Customizations::class)->where(['id'=>$id])->first();

        return view("admin.customizations_edit", $data);
    }

    public function updateCustomizations(Request $request, $id) {
        app(Customizations::class)->where(['id'=>$id])->update(['name'=>$request->name, 'updated_at'=>time()]);

        return redirect()->to('/admin/customizations');
    }

    public function profiles(Request $request) {
        $data['title'] = "Taist - Admin Panel";
        $user = $this->guard()->user();
        $data['user'] = $user;
        $data['profiles'] = DB::table('tbl_users as u')->leftJoin('tbl_availabilities as a', 'a.user_id', '=', 'u.id')->where(['user_type' => 2, 'is_pending' => 0, 'verified' => 1])
            ->select(['u.*', 'a.bio', 'a.monday_start', 'a.monday_end', 'a.tuesday_start', 'a.tuesday_end', 'a.wednesday_start', 'a.wednesday_end', 'a.thursday_start', 'a.thursday_end', 'a.friday_start', 'a.friday_end', 'a.saterday_start', 'a.saterday_end', 'a.sunday_start', 'a.sunday_end', 'a.minimum_order_amount', 'a.max_order_distance'])->get();

        return view("admin.profiles", $data);
    }

    public function editProfiles(Request $request, $id) {
        $data['title'] = "Taist - Admin Panel";
        $user = $this->guard()->user();
        $data['user'] = $user;
        $data['profile'] = app(Availabilities::class)->where(['user_id'=>$id])->first();

        return view("admin.profiles_edit", $data);
    }

    public function updateProfiles(Request $request, $id) {
        app(Availabilities::class)->where(['id'=>$id])->update(['bio'=>$request->bio, 'updated_at'=>time()]);

        return redirect()->to('/admin/profiles');
    }

    public function earnings(Request $request) {
        $data['title'] = "Taist - Admin Panel";
        $user = $this->guard()->user();
        $data['user'] = $user;
        $data['earnings'] = DB::table('tbl_users as u')->join('tbl_orders as o', 'o.chef_user_id', '=', 'u.id')
            ->where(['user_type' => 2, 'is_pending' => 0, 'verified' => 1])
            ->where(['status' => 3])
            ->selectRaw('u.*, SUM(CASE WHEN o.updated_at > DATE_SUB(NOW(), INTERVAL 1 MONTH) THEN o.total_price ELSE 0 END) AS monthly_earning, SUM(CASE WHEN o.updated_at > DATE_SUB(NOW(), INTERVAL 1 MONTH) THEN 1 ELSE 0 END) AS monthly_orders, SUM(CASE WHEN o.updated_at > DATE_SUB(NOW(), INTERVAL 1 MONTH) THEN o.amount ELSE 0 END) AS monthly_items, SUM(CASE WHEN o.updated_at > DATE_SUB(NOW(), INTERVAL 1 YEAR) THEN o.total_price ELSE 0 END) AS yearly_earning, SUM(CASE WHEN o.updated_at > DATE_SUB(NOW(), INTERVAL 1 YEAR) THEN 1 ELSE 0 END) AS yearly_orders, SUM(CASE WHEN o.updated_at > DATE_SUB(NOW(), INTERVAL 1 YEAR) THEN o.amount ELSE 0 END) AS yearly_items')
            ->get();

        return view("admin.earnings", $data);
    }

    public function customers(Request $request) {
        $data['title'] = "Taist - Admin Panel";
        $user = $this->guard()->user();
        $data['user'] = $user;
        $data['customers'] = app(Listener::class)->where(['user_type'=>1])->get();

        return view("admin.customers", $data);
    }

    public function chats(Request $request) {
        $data['title'] = "Taist - Admin Panel";
        $user = $this->guard()->user();
        $data['user'] = $user;
        $data['chats'] = DB::table('tbl_conversations as c')->leftJoin('tbl_users as f', 'c.from_user_id', '=', 'f.id')->leftJoin('tbl_users as t', 'c.to_user_id', '=', 't.id')
            ->select(['c.*', 'f.email as from_user_email', 'f.first_name as from_first_name', 'f.last_name as from_last_name', 't.email as to_user_email', 't.first_name as to_first_name', 't.last_name as to_last_name'])->get();

        return view("admin.chats", $data);
    }

    public function orders(Request $request) {
        $data['title'] = "Taist - Admin Panel";
        $user = $this->guard()->user();
        $data['user'] = $user;
        $data['orders'] = DB::table('tbl_orders as o')->leftJoin('tbl_users as f', 'o.customer_user_id', '=', 'f.id')->leftJoin('tbl_users as t', 'o.chef_user_id', '=', 't.id')->leftJoin('tbl_menus as m', 'm.id', '=', 'o.menu_id')->leftJoin('tbl_reviews as r', 'r.order_id', '=', 'o.id')
            ->select(['o.*', 'f.email as customer_user_email', 'f.first_name as customer_first_name', 'f.last_name as customer_last_name', 't.email as chef_user_email', 't.first_name as chef_first_name', 't.last_name as chef_last_name', 'm.title as menu_title', 'r.rating as rating', 'r.review as review', 'r.tip_amount as tip_amount'])->get();

        foreach ($data['orders'] as &$a) {
            $a->status_str = $this->getOrderStatus($a->status);;
        }

        return view("admin.orders", $data);
    }

    public function reviews(Request $request) {
        $data['title'] = "Taist - Admin Panel";
        $user = $this->guard()->user();
        $data['user'] = $user;
        $data['reviews'] = DB::table('tbl_reviews as r')->leftJoin('tbl_users as f', 'r.from_user_id', '=', 'f.id')->leftJoin('tbl_users as t', 'r.to_user_id', '=', 't.id')
            ->select(['r.*', 'f.email as from_user_email', 't.email as to_user_email'])->get();

        return view("admin.reviews", $data);
    }

    public function contacts(Request $request) {
        $data['title'] = "Taist - Admin Panel";
        $user = $this->guard()->user();
        $data['user'] = $user;
        $data['contacts'] = DB::table('tbl_tickets as t')->leftJoin('tbl_users as u', 't.user_id', '=', 'u.id')
            ->select(['t.*', 'u.email as user_email'])->get();

        return view("admin.contacts", $data);
    }

    public function transactions(Request $request) {
        $data['title'] = "Taist - Admin Panel";
        $user = $this->guard()->user();
        $data['user'] = $user;
        $data['transactions'] = app(Transactions::class)->get();

        return view("admin.transactions", $data);
    }

    public function zipcodes(Request $request) {
        $data['title'] = "Taist - Admin Panel";
        $user = $this->guard()->user();
        $data['user'] = $user;
        $data['zipcodes'] = app(Zipcodes::class)->first();

        return view("admin.zipcodes", $data);
    }

    public function updateZipcodes(Request $request) {
        $zipcodes = app(Zipcodes::class)->first();
        $zipcodes->update(['zipcodes'=>$request->zipcodes, 'updated_at'=>time()]);

        return redirect()->to('/admin/zipcodes');
    }
    
    public function exportChefs(Request $request) {
        $user = $this->guard()->user();
        $data = [[
            'Email',
            'First name',
            'Last name',
            'Phone',
            'Birthday',
            'Address',
            'City',
            'State',
            'Zip',
            'Status',
            'Created at'
        ]];
        
        //$rows = app(Listener::class)->where(['user_type'=>2, 'is_pending'=>0])->get();
        $rows = app(Listener::class)->where(['user_type'=>2])->get();
        foreach ($rows as &$a) {
            $a['status'] = $this->getUserStatus($a['verified']);
            $data[] = [
                $a['email'],
                $a['first_name'],
                $a['last_name'],
                $a['phone'],
                date('Y-m-d', $a['birthday']),
                $a['address'],
                $a['city'],
                $a['state'],
                $a['zip'],
                $a['status'],
                date('Y-m-d H:i:s', ((int)$a['created_at'])),
            ];
        }

        $xlsx = SimpleXLSXGen::fromArray( $data );
        $xlsx->downloadAs('Taist - Chefs.xlsx');
    }

    public function exportPendings(Request $request) {
        $user = $this->guard()->user();
        $data = [[
            'Email',
            'First name',
            'Last name',
            'Phone',
            'Birthday',
            'Address',
            'City',
            'State',
            'Zip',
            'Status',
            'Created at'
        ]];
        
        $rows = app(Listener::class)->where(['user_type'=>2, 'is_pending'=>1])->get();
        foreach ($rows as &$a) {
            $a['status'] = $this->getUserStatus($a['verified']);
            $data[] = [
                $a['email'],
                $a['first_name'],
                $a['last_name'],
                $a['phone'],
                date('Y-m-d', $a['birthday']),
                $a['address'],
                $a['city'],
                $a['state'],
                $a['zip'],
                $a['status'],
                date('Y-m-d H:i:s', ((int)$a['created_at'])),
            ];
        }

        $xlsx = SimpleXLSXGen::fromArray( $data );
        $xlsx->downloadAs('Taist - Pending chefs.xlsx');
    }

    public function exportCustomers(Request $request) {
        $user = $this->guard()->user();
        $data = [[
            'Email',
            'First name',
            'Last name',
            'Phone',
            'Birthday',
            'Address',
            'City',
            'State',
            'Zip',
            'Status',
            'Created at'
        ]];
        
        $rows = app(Listener::class)->where(['user_type'=>1])->get();
        foreach ($rows as &$a) {
            $a['status'] = $this->getUserStatus($a['verified']);
            $data[] = [
                $a['email'],
                $a['first_name'],
                $a['last_name'],
                $a['phone'],
                date('Y-m-d', $a['birthday']),
                $a['address'],
                $a['city'],
                $a['state'],
                $a['zip'],
                $a['status'],
                date('Y-m-d H:i:s', ((int)$a['created_at'])),
            ];
        }

        $xlsx = SimpleXLSXGen::fromArray( $data );
        $xlsx->downloadAs('Taist - Customers.xlsx');
    }

}
