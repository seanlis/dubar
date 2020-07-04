EPUBJS.reader.plugins.SearchController = function(Book) {
	var reader = this;
	
	var $searchBox = $("#searchBox"),
			$searchResults = $("#searchResults"),
			$searchView = $("#searchView"),
			iframeDoc;
	
	var searchShown = false;

	var queryString = '';
	
	var onShow = function() {
		query();
		searchShown = true;
		$searchView.addClass("shown");
	};
	
	var onHide = function() {
		searchShown = false;
		$searchView.removeClass("shown");
	};

	var search = function (q) {
		var book = reader.book;
		return Promise.all(
			book.spine.spineItems.map(item => item.load(book.load.bind(book)).then(item.find.bind(item, q)).finally(item.unload.bind(item)))
		).then(results => [].concat.apply([], results));
	};

	var highlightQuery = function () {
		if(queryString == '') {
			return;
		}

		iframeDoc = $("#viewer iframe")[0].contentDocument;
		$(iframeDoc).find('body').highlight(queryString, { element: 'span' });
	};

	var query = function() {
		queryString = $searchBox.val();
		
		if(queryString == '') {
			return;
		}
		
		$searchResults.empty();
		$searchResults.append("<li><p>Searching...</p></li>");

		search(queryString).then(function(results) {
			$searchResults.empty();
			
			if(iframeDoc) {
				$(iframeDoc).find('body').unhighlight();
			}

			if(results.length == 0) {
				$searchResults.append("<li><p>No Results Found</p></li>");
				return;
			}
			
			highlightQuery();

			results.forEach(function(result) {
				var $li = $("<li></li>");
				var $item = $("<a href='#"+result.cfi+"' data-cfi='"+result.cfi+"'><p>"+result.excerpt+"</p></a>");
	
				$item.on("click", function(e) {
					var $this = $(this),
							cfi = $this.data("cfi");
					
					e.preventDefault();

					if(iframeDoc) {
						$(iframeDoc).find('body').unhighlight();
					}

					reader.rendition.display(cfi);
				});
				$li.append($item);
				$searchResults.append($li);
			});
	
		});
	
	};
	
	$searchBox.on("search", function(e) {
		queryString = $searchBox.val();
		
		//-- SearchBox is empty or cleared
		if(queryString == '') {
			$searchResults.empty();
			if(reader.SidebarController.getActivePanel() == "Search") {
				reader.SidebarController.changePanelTo("Toc");
			}
			
			$(iframeDoc).find('body').unhighlight();
			iframeDoc = false;
			return;
		}
		
		reader.SidebarController.changePanelTo("Search");
		
		e.preventDefault();
	});
	
	reader.on("reader:bookready", function() {
		reader.rendition.hooks.content.register(function(contents){
			return contents.addStylesheetCss(".highlight { background-color: yellow }", "search");
		});

		reader.rendition.on('relocated', highlightQuery);
	});
	
	return {
		"show" : onShow,
		"hide" : onHide
	};
};
