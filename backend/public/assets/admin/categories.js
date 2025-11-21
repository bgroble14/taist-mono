$(function() {	
    var table = $('#table').DataTable({});
    $('#table').on('click', 'tbody tr', function (e) {
        e.currentTarget.classList.toggle('selected');
    });
    $('#table').on( 'page.dt', function (e) {
        tableEvent()
    });
    $('#table').on( 'order.dt', function (e) {
        tableEvent()
    });
    $('#table').on( 'search.dt', function (e) {
        tableEvent()
    });
    tableEvent();

    $('.bt_status').click(function () {
        var status = $(this).data('status')
        var rows = table.rows('.selected').indexes();
        var data = table.rows(rows).ids().join();
        if(!data || data == '') {
            showAlert('Please select a row to change the category status.');
            return false;
        }
        showConfirm("", "Are you sure you want to change the selected categories status?", function() {
            $.getJSON('/adminapi/change_category_status?ids='+data+'&api_token='+token+'&status='+status, function(res) {
                window.location.reload();
            });
        })
    });
    
})

function tableEvent() {
	$('.table td.date').each(function() {
		$(this).text(moment($(this).attr('date')*1000).utc(true).format('YYYY-MM-DD HH:mm:ss'));
	})
}