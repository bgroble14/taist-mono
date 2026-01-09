$(function() {	
    var table = $('#table').DataTable({
        order: [[0, 'desc']],
        initComplete: function () {
            this.api()
                .columns()
                .every(function () {
                    let column = this;
     
                    if (column.selector.cols == 5 || column.selector.cols == 13) return false;

                    // Create select element
                    let select = document.createElement('select');
                    select.add(new Option(''));
                    column.footer().replaceChildren(select);
     
                    // Apply listener for user change in value
                    select.addEventListener('change', function () {
                        column
                            .search(select.value, {exact: true})
                            .draw();
                    });
     
                    // Add list of options
                    column
                        .data()
                        .unique()
                        .sort()
                        .each(function (d, j) {
                            select.add(new Option(d));
                        });
                });
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
    $('#table').on( 'draw.dt', function (e) {
        tableEvent()
    });
    tableEvent();

    $('.bt_export_csv').click(function() {
        location.href = "/admin/export_customers";
    })

    $('.bt_status').click(function () {
        var status = $(this).data('status')
        var rows = table.rows('.selected').indexes();
        var data = table.rows(rows).ids().join();
        if(!data || data == '') {
            showAlert('Please select a row to change the customer status.');
            return false;
        }
        showConfirm("", "Are you sure you want to change the selected customer status?", function() {
            $.ajax({
                url: '/adminapi/change_chef_status',
                method: 'GET',
                data: {
                    ids: data,
                    api_token: token,
                    status: status
                },
                success: function(res) {
                    if (res.success) {
                        window.location.reload();
                    } else {
                        showAlert('Error: ' + (res.error || 'Unknown error'));
                    }
                },
                error: function(xhr, status, error) {
                    showAlert('Request failed: ' + error + ' (Status: ' + xhr.status + ')');
                    console.error('API Error:', xhr.responseText);
                }
            });
        })
    });

})

function tableEvent() {
	$('.table td.date').each(function() {
		$(this).text(moment($(this).attr('date')*1000).utc(true).format('YYYY-MM-DD HH:mm:ss'));
	})
}