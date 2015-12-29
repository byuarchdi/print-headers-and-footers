# Print Headers and Footers

This project was created to fix the problem of printing headers and footers in Chrome. Right now there is a bug in Chrome that does not allow elements with fixed positioning to repeat when printed, thus headers and footers are difficult to print. You can check the status of the bug [here](https://code.google.com/p/chromium/issues/detail?id=303728).

## Installation and setup
Things will be easier if you use NPM. Clone the repository and run the following command to obtain all dependencies:

    npm install

Include the necessary scripts and stylesheet:

    <script src="/node_modules/css-regions-polyfill/bin/css-regions-polyfill.min.js"></script>
    <script src="/src/print-headers-and-footers.js"></script>
    <link rel="stylesheet" href="/src/print-headers-and-footers.css">

## Usage

To start things off, put the content that you want printed inside of an element with a unique id. When printing, all content not inside of this element will be hidden momentarily until printing is complete:

    <body>
    	<!--a bunch of html junk-->
    	<div id="print-container">
    		<!--Amazing html to print-->
    	</div>
    	<!--more html junk-->
    </body>

The library must then be initialized through the global PrintHAF object. You MUST initialize the library before printing:

    PrintHAF.init({
				domID: 'print-container', // The id of the HTML element that contains the content to be printed
				size: 'letter', // Dimensions when printed (letter, legal, or tabloid), takes precedence over width and height
				width: 816, // Width when printed (pixels), does not apply if size is set
				height: 1056, // Height when printed (pixels), does not apply if size is set
				marginTop: 48, // Margin when printed (pixels), defaults to 0 if omitted
				marginBottom: 48, // Margin when printed (pixels), defaults to 0 if omitted
				marginLeft: 48, // Margin when printed (pixels), defaults to 0 if omitted
				marginRight: 48, // Margin when printed (pixels), defaults to 0 if omitted
				createHeaderTemplate: function(pageNumber) { // Optional, called every time a page is created, should return a DOM node
					var header = document.createElement('div');
					header.innerHTML = 'HEADER ' + pageNumber;
					
					return header;
				},
				createFooterTemplate: function(pageNumber) { // Optional, called every time a page is created, should return a DOM node
					var footer = document.createElement('div');
					footer.innerHTML = 'FOOTER ' + pageNumber;
					
					return footer;
				},
				before: function() { //Optional, runs before printing
				  // Do any necessary preparations for printing
				},
				after: function() { //Optional, runs after printing
				  // Clean up any preparations for printing
				}
			});
		
When you are ready to print, use the following:

    PrintHAF.print()
	
Remember that you cannot print with ctrl+p or window.print(), you MUST call PrintHAF.print.
		
## Things to Consider
* All units entered in initialization should be in pixels
* Currently, all browsers should treat 96 pixels as 1 inch
* All of the content that you want to be printed should be placed inside of a containing element with an id
    * That id is the domID in PrintHAF.init
* Complex content might not flow properly from page to page (especially columnized content)
   * Please feel free to open issues with a repeatable example
* You must call PrintHAF.print to start printing

## Compatibility
There is minimal testing right now. The project is designed for and manually tested on Chrome, but should work well in other major browsers.

## Examples
Look inside of the examples directory. Feel free to pull request with as many examples as you'd like.

## Big Thanks
This project would not have been possible without the [CSS Regions Polyfill](https://github.com/FremyCompany/css-regions-polyfill) by FremyCompany. Please star their repo!
