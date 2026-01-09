$(function() {
    var table = $('#table').DataTable({ order: [[0, 'desc']] });

    // Default filter to show only "Requested" categories
    table.column(4).search('Requested').draw();

    // Filter button handlers
    $('.bt_filter').click(function() {
        $('.bt_filter').removeClass('active');
        $(this).addClass('active');
        var filter = $(this).data('filter');
        if (filter === 'all') {
            table.column(4).search('').draw();
        } else if (filter === 'requested') {
            table.column(4).search('Requested').draw();
        } else if (filter === 'approved') {
            table.column(4).search('Approved').draw();
        } else if (filter === 'rejected') {
            table.column(4).search('Rejected').draw();
        }
    });

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