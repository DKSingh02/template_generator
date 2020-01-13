$(function() {
    $('select[name="dropDown"]').change(function() {
        var $this = $(this);
        console.log($this.val());
    });
});