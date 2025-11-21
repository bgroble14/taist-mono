$(function() {	
    $('#table').DataTable({});
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

})

function tableEvent() {
	$('.table td.date').each(function() {
		$(this).text(moment($(this).attr('date')*1000).utc(true).format('YYYY-MM-DD'));
	})
}