$(function() {
	$('a.delete').click(function(e) {
		if(confirm('Are you sure to delete this?')) {
			var href = $(this).attr('href')
			$.ajax({
				type: 'DELETE',
				url: href,
				success: function() {
					document.location.reload()
				}
			})
		}
		e.preventDefault();
		return false
	});
	
	$('.add-option-to-select').click(function(e){
		var selectId = $(this).attr('data-target');
		var select = $('#'+selectId);
		if(select.prop("tagName") === 'SELECT'){
			var optionText = prompt('Element to add :');
			select.append('<option value="'+optionText+'">'+optionText+'</option>');
			select.find('option[value="'+optionText+'"]').prop('selected', true);
		}
	});
});
