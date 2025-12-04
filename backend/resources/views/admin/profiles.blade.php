@extends('layouts.admin')
@section('content')
   <link rel="stylesheet" href="/assets/admin/index.css?r={{ time() }}">
	<div class="admin_wrapper">
      <div class="flex flex_acenter mb24">
         <div class="fsize24 font_bold">Profiles</div>
      </div>
      <div class="flex flex_end mb10">
         <!--<a class="bt bt_new" style="margin:0" href="/admin/chef">+ Add</a>-->
      </div>
      <div class="div_table">
         <table class="table" id="table">
            <thead>
               <tr>
                  <th>Chef ID</th>
                  <th>Chef email</th>
                  <th>Chef name</th>
                  <th>Bio</th>
                  <th>Monday</th>
                  <th>Tuesday</th>
                  <th>Wednesday</th>
                  <th>Thursday</th>
                  <th>Friday</th>
                  <th>Saturday</th>
                  <th>Sunday</th>
                  <th>Min Order Amount</th>
                  <th>Max Order Distance</th>
                  <th>Created at</th>
                  <th></th>
               </tr>
            </thead>
            <tbody>
               <?php foreach ($profiles as $a) { ?>
                  <tr id="<?php echo $a->id;?>">
                     <td><?php echo 'CHEF'.sprintf('%07d', $a->id);?></td>
                     <td><?php echo $a->email;?></td>
                     <td><?php echo $a->first_name;?> <?php echo $a->last_name;?></td>
                     <td><?php echo $a->bio;?></td>
                     <td><?php 
                        $mondayStart = $a->monday_start ? (is_numeric($a->monday_start) ? date('H:i', (int)$a->monday_start) : $a->monday_start) : '';
                        $mondayEnd = $a->monday_end ? (is_numeric($a->monday_end) ? date('H:i', (int)$a->monday_end) : $a->monday_end) : '';
                        echo $mondayStart ? $mondayStart . ' - ' . $mondayEnd : '';
                     ?></td>
                     <td><?php 
                        $tuesdayStart = $a->tuesday_start ? (is_numeric($a->tuesday_start) ? date('H:i', (int)$a->tuesday_start) : $a->tuesday_start) : '';
                        $tuesdayEnd = $a->tuesday_end ? (is_numeric($a->tuesday_end) ? date('H:i', (int)$a->tuesday_end) : $a->tuesday_end) : '';
                        echo $tuesdayStart ? $tuesdayStart . ' - ' . $tuesdayEnd : '';
                     ?></td>
                     <td><?php 
                        $wednesdayStart = $a->wednesday_start ? (is_numeric($a->wednesday_start) ? date('H:i', (int)$a->wednesday_start) : $a->wednesday_start) : '';
                        $wednesdayEnd = $a->wednesday_end ? (is_numeric($a->wednesday_end) ? date('H:i', (int)$a->wednesday_end) : $a->wednesday_end) : '';
                        echo $wednesdayStart ? $wednesdayStart . ' - ' . $wednesdayEnd : '';
                     ?></td>
                     <td><?php 
                        $thursdayStart = $a->thursday_start ? (is_numeric($a->thursday_start) ? date('H:i', (int)$a->thursday_start) : $a->thursday_start) : '';
                        $thursdayEnd = $a->thursday_end ? (is_numeric($a->thursday_end) ? date('H:i', (int)$a->thursday_end) : $a->thursday_end) : '';
                        echo $thursdayStart ? $thursdayStart . ' - ' . $thursdayEnd : '';
                     ?></td>
                     <td><?php 
                        $fridayStart = $a->friday_start ? (is_numeric($a->friday_start) ? date('H:i', (int)$a->friday_start) : $a->friday_start) : '';
                        $fridayEnd = $a->friday_end ? (is_numeric($a->friday_end) ? date('H:i', (int)$a->friday_end) : $a->friday_end) : '';
                        echo $fridayStart ? $fridayStart . ' - ' . $fridayEnd : '';
                     ?></td>
                     <td><?php 
                        $saturdayStart = $a->saterday_start ? (is_numeric($a->saterday_start) ? date('H:i', (int)$a->saterday_start) : $a->saterday_start) : '';
                        $saturdayEnd = $a->saterday_end ? (is_numeric($a->saterday_end) ? date('H:i', (int)$a->saterday_end) : $a->saterday_end) : '';
                        echo $saturdayStart ? $saturdayStart . ' - ' . $saturdayEnd : '';
                     ?></td>
                     <td><?php 
                        $sundayStart = $a->sunday_start ? (is_numeric($a->sunday_start) ? date('H:i', (int)$a->sunday_start) : $a->sunday_start) : '';
                        $sundayEnd = $a->sunday_end ? (is_numeric($a->sunday_end) ? date('H:i', (int)$a->sunday_end) : $a->sunday_end) : '';
                        echo $sundayStart ? $sundayStart . ' - ' . $sundayEnd : '';
                     ?></td>
                     <td><?php echo $a->minimum_order_amount;?></td>
                     <td><?php echo $a->max_order_distance;?></td>
                     <td><?php echo $a->created_at;?></td>
                     <td class="tright">
                        <a class="bt_edit clrblue1 mr20" href="/admin/profiles/<?php echo $a->id;?>">Edit</a>
                     </td>
                  </tr>
               <?php } ?>
            </tbody>
         </table>
      </div>
   </div>

@endsection
@section('page-scripts')
   <script src="/assets/admin/index.js?r={{ time() }}"></script>
   <script src="/assets/admin/chefs.js?r={{ time() }}"></script>
   <script>
      $('.l_menu_item_profiles').addClass('sel');
      $('.sub_chefs').toggleClass('sub_menu1');
      $('.toggle-arrow').toggleClass('open');
   </script>
@endsection