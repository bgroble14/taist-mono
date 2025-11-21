@extends('layouts.admin')
@section('content')
   <link rel="stylesheet" href="{{ url('assets/admin/index.css?r='.time()) }}">
   <?php 
      include $_SERVER['DOCUMENT_ROOT'].'/include/config.php';
   ?>
	<div class="admin_wrapper">
      <div class="fsize24 font_bold mb24">Orders</div>
      <div class="div_table">
         <table class="table" id="table">
            <thead>
               <tr>
                  <th>Order ID</th>
                  <th>Customer ID</th>
                  <th>Customer Email</th>
                  <th>Customer Name</th>
                  <th>Menu Item ID</th>
                  <th>Menu Item</th>
                  <th>Chef ID</th>
                  <th>Chef Email</th>
                  <th>Chef Name</th>
                  <th>Quantity</th>
                  <th>Total Price</th>
                  <th>Address</th>
                  <th>Order Date</th>
                  <th>Order Time</th>
                  <th>Rating</th>
                  <th>Tip Amount</th>
                  <th>Review</th>
                  <th>Refund Amount</th>
                  <th>Status</th>
                  <th>Created at</th>
               </tr>
            </thead>
            <tbody>
               <?php foreach ($orders as $a) { ?>
                  <tr id="<?php echo $a->id;?>">
                     <td><?php echo 'ORDER'.sprintf('%07d', $a->id);?></td>
                     <td><?php echo 'C'.sprintf('%07d', $a->customer_user_id);?></td>
                     <td><?php echo $a->customer_user_email;?></td>
                     <td><?php echo $a->customer_first_name;?> <?php echo $a->customer_last_name;?></td>
                     <td><?php echo 'MI'.sprintf('%07d', $a->menu_id);?></td>
                     <td><?php echo $a->menu_title;?></td>
                     <td><?php echo 'CHEF'.sprintf('%07d', $a->chef_user_id);?></td>
                     <td><?php echo $a->chef_user_email;?></td>
                     <td><?php echo $a->chef_first_name;?> <?php echo $a->chef_last_name;?></td>
                     <td><?php echo $a->amount;?></td>
                     <td>$<?php echo $a->total_price;?></td>
                     <td><?php echo $a->address;?></td>
                     <td><?php echo date('Y-m-d', ((int)$a->order_date));?></td>
                     <td><?php echo date('H:i', ((int)$a->order_date));?></td>
                     <td><?php echo $a->rating;?></td>
                     <td><?php echo $a->tip_amount;?></td>
                     <td><?php echo $a->review;?></td>
                     <td></td>
                     <td><?php echo $a->status_str;?></td>
                     <td class="date" date="<?php echo $a->created_at;?>"></td>
                  </tr>
               <?php } ?>
            </tbody>
         </table>
      </div>
   </div>

@endsection
@section('page-scripts')
   <script src="{{ url('assets/admin/index.js?r='.time()) }}"></script>
   <script src="{{ url('assets/admin/orders.js?r='.time()) }}"></script>
   <script>
      $('.l_menu_item_orders').addClass('sel');
   </script>
@endsection