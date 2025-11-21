<?php 
    include "config.php";
    include "SimpleXLSXGen.php";

    $connect = connect($database);

	$data = [
        'Email',
        'First name',
        'Last name',
        'Category',
        'Local time',
        'Date of Signup',
        'City',
        'State',
        'Country',
        'Waiting time',
        'Access code',
        'Username',
    ];
    $type = $_REQUEST['type'];
    if ($type == "admit")
        $type = 1;
    else if ($type == "deny")
        $type = -1;
    else
        $type = 0;
    
    $statement = $connect->prepare('SELECT * FROM tbl_user WHERE verified=:type order by id DESC');
    $statement->execute([':type'=>$type]);
    $list = $statement->fetchAll();
    foreach ($list as &$a) {        
        $statement = $connect->prepare('SELECT * FROM tbl_invitation WHERE to_user_id=:id');
        $statement->execute([':id'=>$a['id']]);
        $temp = $statement->fetch();
        $a['code'] = $temp ? $temp['ref_code'] : '';
        $row = [
            $a['email'],
            $a['first_name'],
            $a['last_name'],
            '',
            '',
            ($a['created_at']),
            $a['city'],
            $a['state'],
            $a['country'],
            $a['status_at'] ? secondsToDhms($a['status_at']- strtotime($a['created_at'])) : secondsToDhms(time()- strtotime($a['created_at'])),
            $a['code'],
            $a['username'],
        ];
        $data[] = $row;
    }
    echo json_encode($data);

    if ($type == 1)
        $type = 'Admit';
    else if ($type == -1)
        $type = 'Denied';
    else
        $type = 'Pending';

?>