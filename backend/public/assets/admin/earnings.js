$(function() {	
    $('#table').DataTable({
        order: [[0, 'desc']],
        initComplete: function () {
            this.api()
                .columns()
                .every(function () {
                    let column = this;
     
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

    $('.bt_export_csv').click(function() {
        location.href = "/admin/export_chefs";
    })

    $('.bt_pending_export_csv').click(function() {
        location.href = "/admin/export_pendings";
    })
})

function tableEvent() {
	$('.table td.date').each(function() {
		$(this).text(moment($(this).attr('date')*1000).utc(true).format('YYYY-MM-DD HH:mm:ss'));
	})
}