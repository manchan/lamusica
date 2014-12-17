$(function() {
    // When the window is resized
    // (You'll probably want to debounce this)
    $(window).resize(function(e) {

        e.preventDefault();
        // Find all YouTube videos
        var $allVideos = $("iframe[src^='https://www.youtube.com']"),
        // The element that is fluid width
            $fluidEl = $("#content");
        // Figure out and save aspect ratio for each video
        $allVideos.each(function() {
            $(this).data('aspectRatio', this.height / this.width)
                // and remove the hard coded width/height
                .removeAttr('height')
                .removeAttr('width');
        });
        var newWidth = $fluidEl.width();
        // Resize all videos according to their own aspect ratio
        $allVideos.each(function() {
            var $el = $(this);
            $el.width(newWidth).height(newWidth * $el.data('aspectRatio'));

        });
        // Kick off one resize to fix all videos on page load
    }).resize();
});