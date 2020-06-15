EPUBJS.reader.ReaderController = function(book) {
	var $main = $("#main"),
			$divider = $("#divider"),
			$loader = $("#loader"),
			$next = $("#next"),
			$prev = $("#prev"),
			$arrows = $(".arrow");
	var reader = this;
	var book = this.book;
	var rendition = this.rendition;
	var slideIn = function() {
		var currentPosition = reader.rendition.currentLocation().start.cfi;
		if (reader.settings.sidebarReflow){
			$main.removeClass('single');
			$main.one("transitionend", function(){
				reader.rendition.resize();
			});
		} else {
			$main.removeClass("closed");
		}
	};

	var slideOut = function() {
		var location = reader.rendition.currentLocation();
		if (!location) {
			return;
		}
		var currentPosition = location.start.cfi;
		if (reader.settings.sidebarReflow){
			$main.addClass('single');
			$main.one("transitionend", function(){
				reader.rendition.resize();
			});
		} else {
			$main.addClass("closed");
		}
	};

	var showLoader = function() {
		$loader.show();
		hideDivider();
	};

	var hideLoader = function() {
		$loader.hide();

		//-- If the book is using spreads, show the divider
		// if(book.settings.spreads) {
		// 	showDivider();
		// }
	};

	var showDivider = function() {
		$divider.addClass("show");
	};

	var hideDivider = function() {
		$divider.removeClass("show");
	};

	var keylock = false;

	var arrowKeys = function(e) {
		if(e.keyCode == 37) {

			if(reader.book.package.metadata.direction === "rtl") {
				reader.rendition.next();
			} else {
				reader.rendition.prev();
			}

			$prev.addClass("active");

			keylock = true;
			setTimeout(function(){
				keylock = false;
				$prev.removeClass("active");
			}, 100);

			 e.preventDefault();
		}
		if(e.keyCode == 39) {

			if(reader.book.package.metadata.direction === "rtl") {
				reader.rendition.prev();
			} else {
				reader.rendition.next();
			}

			$next.addClass("active");

			keylock = true;
			setTimeout(function(){
				keylock = false;
				$next.removeClass("active");
			}, 100);

			 e.preventDefault();
		}
	}


	$next.on("click", function(e){

		if(reader.book.package.metadata.direction === "rtl") {
			reader.rendition.prev();
		} else {
			reader.rendition.next();
		}

		e.preventDefault();
	});

	$prev.on("click", function(e){

		if(reader.book.package.metadata.direction === "rtl") {
			reader.rendition.next();
		} else {
			reader.rendition.prev();
		}

		e.preventDefault();
	});

	this.on("reader:bookready", function () {
		$arrows.show();
		document.addEventListener('keydown', arrowKeys, false);

		reader.rendition.on("layout", function(props){
			if(props.spread === true) {
				showDivider();
			} else {
				hideDivider();
			}
		});

		reader.rendition.on('relocated', function(location){
			if (location.atStart) {
				$prev.addClass("disabled");
			}
			if (location.atEnd) {
				$next.addClass("disabled");
			}
		});
	});

	return {
		"slideOut" : slideOut,
		"slideIn"  : slideIn,
		"showLoader" : showLoader,
		"hideLoader" : hideLoader,
		"showDivider" : showDivider,
		"hideDivider" : hideDivider,
		"arrowKeys" : arrowKeys
	};
};
