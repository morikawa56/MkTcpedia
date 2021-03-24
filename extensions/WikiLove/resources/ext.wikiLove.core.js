( function ( $, mw ) {

	var options = {}, // options modifiable by the user
		$dialog = null, // dialog jQuery object
		currentTypeId = null, // id of the currently selected type (e.g. 'barnstar' or 'makeyourown')
		currentSubtypeId = null, // id of the currently selected subtype (e.g. 'original' or 'special')
		currentTypeOrSubtype = null, // content of the current (sub)type (i.e. an object with title, descr, text, etc.)
		rememberData = null, // input data to remember when switching types or subtypes
		emailable = false, // whether or not the target user is emailable
		redirect = true, // whether or not to redirect the user to the WikiLove message after it has been posted
		targets = [], // the recipients of the WikiLove
		maxRecipients = 10, // maximum number of simultaneous recipients
		gallery = {},
		api = new mw.Api();

	$.wikiLove = {
		/**
		 * Opens the dialog and builds it if necessary.
		 * @param {string[]} recipients Usernames of recipients (without namespace prefix)
		 */
		openDialog: function ( recipients ) {
			var type, $typeList, typeId, $button, commonsLink, termsLink;
			// If a list of recipients are specified, this will override the normal
			// behavior of WikiLove, which is to post on the Talk page of the
			// current page. It will also disable redirecting the user after submitting.
			if ( recipients ) {
				if ( recipients.length > maxRecipients ) {
					// eslint-disable-next-line no-alert
					alert( mw.msg( 'wikilove-err-max-exceeded', maxRecipients ) );
					return;
				}
				targets = recipients;
				redirect = false;
				// TODO: See if recipients are emailable
			} else {
				targets.push( mw.config.get( 'wgTitle' ) );
				// Test to see if the 'E-mail this user' link exists
				emailable = !!$( '#t-emailuser' ).length;
			}
			if ( $dialog === null ) {
				// Build a type list like this:
				$typeList = $( '<ul id="mw-wikilove-types"></ul>' );
				for ( typeId in options.types ) {
					type = options.types[ typeId ];
					if ( !$.isPlainObject( type ) ) {
						continue;
					}
					$button = $( '<a href="#" class=""></a>' );

					if ( typeof type.icon === 'string' ) {
						$button.append( $( '<img>' ).attr( 'src', type.icon ) );
					} else {
						$button.addClass( 'mw-wikilove-no-icon' );
					}

					$button.append( $( '<span>' ).text( type.name ) );

					$button.data( 'typeId', typeId );
					$typeList.append( $( '<li>' ).append( $button ) );
				}

				commonsLink = mw.html.element( 'a', {
					href: mw.msg( 'wikilove-commons-url' ),
					target: '_blank'
				}, mw.msg( 'wikilove-commons-link' ) );
				termsLink = mw.html.element( 'a', {
					href: mw.msg( 'wikilove-terms-url' ),
					target: '_blank'
				}, mw.msg( 'wikilove-terms-link' ) );

				$dialog = $( '<div id="mw-wikilove-dialog">\
<div id="mw-wikilove-select-type">\
	<span class="mw-wikilove-number">1</span>\
	<h3><html:msg key="wikilove-select-type"/></h3>\
	<ul id="mw-wikilove-types"></ul>\
</div>\
<div id="mw-wikilove-get-started">\
	<h2><span id="mwe-wikilove-pointer-arrow"></span><html:msg key="wikilove-get-started-header"/></h2>\
	<ol>\
		<li><html:msg key="wikilove-get-started-list-1"/></li>\
		<li><html:msg key="wikilove-get-started-list-2"/></li>\
		<li><html:msg key="wikilove-get-started-list-3"/></li>\
	</ol>\
	<p><a target="_blank" href="' + mw.message( 'wikilove-what-is-this-link' ).escaped() + '">\
		<html:msg key="wikilove-what-is-this"/>\
	</a></p>\
	<p id="mw-wikilove-anon-warning"><strong><html:msg key="wikilove-anon-warning"/></strong></p>\
</div>\
<div id="mw-wikilove-add-details">\
	<span class="mw-wikilove-number">2</span>\
	<h3><html:msg key="wikilove-add-details"/></h3>\
	<form id="mw-wikilove-preview-form">\
		<div id="mw-wikilove-image-preview">\
			<div id="mw-wikilove-image-preview-spinner" class="mw-wikilove-spinner"></div>\
			<div id="mw-wikilove-image-preview-content"></div>\
		</div>\
		<label for="mw-wikilove-subtype" id="mw-wikilove-subtype-label"></label>\
		<select id="mw-wikilove-subtype"></select>\
		<div id="mw-wikilove-subtype-description"></div>\
		<label id="mw-wikilove-gallery-label"><html:msg key="wikilove-select-image"/></label>\
		<div id="mw-wikilove-gallery">\
			<div id="mw-wikilove-gallery-error">\
				<html:msg key="wikilove-err-gallery"/>\
				<a href="#" id="mw-wikilove-gallery-error-again"><html:msg key="wikilove-err-gallery-again"/></a>\
			</div>\
			<div id="mw-wikilove-gallery-spinner" class="mw-wikilove-spinner"></div>\
			<div id="mw-wikilove-gallery-content"></div>\
		</div>\
		<label for="mw-wikilove-header" id="mw-wikilove-header-label"><html:msg key="wikilove-header"/></label>\
		<input type="text" class="text" id="mw-wikilove-header"/>\
		<label for="mw-wikilove-title" id="mw-wikilove-title-label"><html:msg key="wikilove-title"/></label>\
		<input type="text" class="text" id="mw-wikilove-title"/>\
		<label for="mw-wikilove-image" id="mw-wikilove-image-label"><html:msg key="wikilove-image"/></label>\
		<span class="mw-wikilove-note" id="mw-wikilove-image-note"><html:msg key="wikilove-image-example"/></span>\
		<input type="text" class="text" id="mw-wikilove-image"/>\
		<div id="mw-wikilove-commons-text">\
		' + mw.message( 'wikilove-commons-text' ).escaped().replace( /\$1/, commonsLink ) + '\
		</div>\
		<label for="mw-wikilove-message" id="mw-wikilove-message-label"><html:msg key="wikilove-enter-message"/></label>\
		<span class="mw-wikilove-note" id="mw-wikilove-message-note"><html:msg key="wikilove-omit-sig"/></span>\
		<textarea id="mw-wikilove-message" rows="4"></textarea>\
		<div id="mw-wikilove-notify">\
			<input type="checkbox" id="mw-wikilove-notify-checkbox" name="notify"/>\
			<label for="mw-wikilove-notify-checkbox"><html:msg key="wikilove-notify"/></label>\
		</div>\
		<button class="submit mw-ui-button mw-ui-progressive" id="mw-wikilove-button-preview" type="submit"></button>\
		<div id="mw-wikilove-preview-spinner" class="mw-wikilove-spinner"></div>\
	</form>\
</div>\
<div id="mw-wikilove-preview">\
	<span class="mw-wikilove-number">3</span>\
	<h3><html:msg key="wikilove-preview"/></h3>\
	<div id="mw-wikilove-preview-area"></div>\
	<div id="mw-wikilove-terms">\
	' + mw.message( 'wikilove-terms' ).escaped().replace( /\$1/, termsLink ) + '\
	</div>\
	<form id="mw-wikilove-send-form">\
		<button class="submit mw-ui-button mw-ui-progressive" id="mw-wikilove-button-send" type="submit"></button>\
		<div id="mw-wikilove-send-spinner" class="mw-wikilove-spinner"></div>\
	</form>\
	<div id="mw-wikilove-success"></div>\
</div>\
</div>' );
				$dialog.localize();

				$dialog.dialog( {
					width: 800,
					position: [ 'center', 80 ],
					autoOpen: false,
					title: mw.msg( 'wikilove-dialog-title' ),
					modal: true,
					resizable: false
				} );
				$dialog.parent().attr( 'id', 'mw-wikilove-overlay' );

				$( '#mw-wikilove-button-preview' ).text( mw.msg( 'wikilove-button-preview' ) );
				$( '#mw-wikilove-button-send' ).text( mw.msg( 'wikilove-button-send' ) );
				$( '#mw-wikilove-add-details' ).hide();
				$( '#mw-wikilove-preview' ).hide();
				$( '#mw-wikilove-types' ).replaceWith( $typeList );
				$( '#mw-wikilove-gallery-error-again' ).on( 'click', $.wikiLove.showGallery );
				$( '#mw-wikilove-types a' ).on( 'click', $.wikiLove.clickType );
				$( '#mw-wikilove-subtype' ).on( 'change', $.wikiLove.changeSubtype );
				$( '#mw-wikilove-preview-form' ).on( 'submit', $.wikiLove.validatePreviewForm );
				$( '#mw-wikilove-send-form' ).on( 'click', $.wikiLove.submitSend );

				if ( !mw.config.get( 'wikilove-anon' ) ) {
					$( '#mw-wikilove-anon-warning' ).hide();
				}

				// When the image changes, we want to reset the preview and error message.
				$( '#mw-wikilove-image' ).on( 'change', function () {
					$( '#mw-wikilove-dialog' ).find( '.mw-wikilove-error' ).remove();
					$( '#mw-wikilove-preview' ).hide();
				} );
			}

			$dialog.dialog( 'open' );
		},

		/**
		 * Handler for the left menu. Selects a new type and initialises next section
		 * depending on whether or not to show subtypes.
		 *
		 * @param {jQuery.Event} e Click event
		 */
		clickType: function ( e ) {
			var subtypeId, subtype,
				newTypeId = $( this ).data( 'typeId' );

			e.preventDefault();
			$.wikiLove.rememberInputData(); // remember previously entered data
			$( '#mw-wikilove-get-started' ).hide(); // always hide the get started section

			if ( currentTypeId !== newTypeId ) { // only do stuff when a different type is selected
				currentTypeId = newTypeId;
				currentSubtypeId = null; // reset the subtype id

				$( '#mw-wikilove-types' ).find( 'a' ).removeClass( 'selected' );
				$( this ).addClass( 'selected' ); // highlight the new type in the menu

				if ( typeof options.types[ currentTypeId ].subtypes === 'object' ) {
					// we're dealing with subtypes here
					currentTypeOrSubtype = null; // reset the (sub)type object until a subtype is selected
					$( '#mw-wikilove-subtype' ).html( '' ); // clear the subtype menu

					for ( subtypeId in options.types[ currentTypeId ].subtypes ) {
						// add all the subtypes to the menu while setting their subtype ids in jQuery data
						subtype = options.types[ currentTypeId ].subtypes[ subtypeId ];
						if ( typeof subtype.option !== 'undefined' ) {
							$( '#mw-wikilove-subtype' ).append(
								$( '<option></option>' ).text( subtype.option ).data( 'subtypeId', subtypeId )
							);
						}
					}
					$( '#mw-wikilove-subtype' ).show();

					// change and show the subtype label depending on the type
					$( '#mw-wikilove-subtype-label' ).text( options.types[ currentTypeId ].select || mw.msg( 'wikilove-select-type' ) );
					$( '#mw-wikilove-subtype-label' ).show();
					$.wikiLove.changeSubtype(); // update controls depending on the currently selected (i.e. first) subtype
				} else {
					// there are no subtypes, just use this type for the current (sub)type
					currentTypeOrSubtype = options.types[ currentTypeId ];
					$( '#mw-wikilove-subtype' ).hide();
					$( '#mw-wikilove-subtype-label' ).hide();
					$( '#mw-wikilove-image-preview' ).hide();
					$.wikiLove.updateAllDetails(); // update controls depending on this type
				}

				$( '#mw-wikilove-add-details' ).show();
				$( '#mw-wikilove-preview' ).hide();
			}
		},

		/**
		 * Handler for changing the subtype.
		 */
		changeSubtype: function () {
			var newSubtypeId = $( '#mw-wikilove-subtype option:selected' ).first().data( 'subtypeId' );

			$.wikiLove.rememberInputData(); // remember previously entered data

			// find out which subtype is selected
			if ( currentSubtypeId !== newSubtypeId ) { // only change stuff when a different subtype is selected
				currentSubtypeId = newSubtypeId;
				currentTypeOrSubtype = options.types[ currentTypeId ]
					.subtypes[ currentSubtypeId ];

				// Insert the item description
				if ( typeof currentTypeOrSubtype.descr === 'string' ) {
					// Replace {{SITENAME}} in messages. Yes, we could have mediawiki.jqueryMsg
					// handle this, but this is a much more lightweight solution.
					currentTypeOrSubtype.descr = currentTypeOrSubtype.descr.replace( /\{\{SITENAME\}\}/g, mw.config.get( 'wgSiteName' ) );
					$( '#mw-wikilove-subtype-description' ).text( currentTypeOrSubtype.descr );
				}

				if ( currentTypeOrSubtype.gallery === undefined && currentTypeOrSubtype.image ) { // not a gallery
					$.wikiLove.showImagePreview();
				} else {
					$( '#mw-wikilove-image-preview' ).hide();
				}

				$.wikiLove.updateAllDetails();
				$( '#mw-wikilove-preview' ).hide();
			}
		},

		/**
		 * Remember data the user entered if it is different from the default.
		 */
		rememberInputData: function () {
			if ( rememberData === null ) {
				rememberData = {
					header: '',
					title: '',
					message: '',
					image: ''
				};
			}
			if ( currentTypeOrSubtype !== null ) {
				if ( currentTypeOrSubtype.fields.indexOf( 'header' ) !== -1 &&
					( !currentTypeOrSubtype.header || $( '#mw-wikilove-header' ).val() !== currentTypeOrSubtype.header )
				) {
					rememberData.header = $( '#mw-wikilove-header' ).val();
				}
				if ( currentTypeOrSubtype.fields.indexOf( 'title' ) !== -1 &&
					( !currentTypeOrSubtype.title || $( '#mw-wikilove-title' ).val() !== currentTypeOrSubtype.title )
				) {
					rememberData.title = $( '#mw-wikilove-title' ).val();
				}
				if ( currentTypeOrSubtype.fields.indexOf( 'message' ) !== -1 &&
					( !currentTypeOrSubtype.message || $( '#mw-wikilove-message' ).val() !== currentTypeOrSubtype.message )
				) {
					rememberData.message = $( '#mw-wikilove-message' ).val();
				}
				if ( currentTypeOrSubtype.gallery === undefined && currentTypeOrSubtype.fields.indexOf( 'image' ) !== -1 &&
					( !currentTypeOrSubtype.image || $( '#mw-wikilove-image' ).val() !== currentTypeOrSubtype.image )
				) {
					rememberData.image = $( '#mw-wikilove-image' ).val();
				}
			}
		},

		/**
		 * Show a preview of the image for a subtype.
		 */
		showImagePreview: function () {
			var $img,
				title = $.wikiLove.normalizeFilename( currentTypeOrSubtype.image ),
				loadingType = currentTypeOrSubtype;
			$( '#mw-wikilove-image-preview' ).show();
			$( '#mw-wikilove-image-preview-content' ).html( '' );
			$( '#mw-wikilove-image-preview-spinner' ).fadeIn( 200 );
			api.post( {
				formatversion: 2,
				action: 'query',
				prop: 'imageinfo',
				iiprop: 'mime|url',
				titles: title,
				iiurlwidth: 75,
				iiurlheight: 68
			} )
				.done( function ( data ) {
					if ( !data || !data.query || !data.query.pages ) {
						$( '#mw-wikilove-image-preview-spinner' ).fadeOut( 200 );
						return;
					}
					if ( loadingType !== currentTypeOrSubtype ) {
						return;
					}
					data.query.pages.forEach( function ( page ) {
						if ( page.imageinfo && page.imageinfo.length ) {
							// build an image tag with the correct url
							$img = $( '<img>' )
								.attr( 'src', page.imageinfo[ 0 ].thumburl )
								.hide()
								.on( 'load', function () {
									$( '#mw-wikilove-image-preview-spinner' ).hide();
									$( this ).css( 'display', 'inline-block' );
								} );
							$( '#mw-wikilove-image-preview-content' ).append( $img );
						}
					} );
				} )
				.fail( function () {
					$( '#mw-wikilove-image-preview-spinner' ).fadeOut( 200 );
				} );
		},

		/**
		 * Called when type or subtype changes, updates controls.
		 */
		updateAllDetails: function () {
			// use remembered data for fields that can be set by the user
			var currentRememberData = {
				header: ( currentTypeOrSubtype.fields.indexOf( 'header' ) !== -1 ? rememberData.header : '' ),
				title: ( currentTypeOrSubtype.fields.indexOf( 'title' ) !== -1 ? rememberData.title : '' ),
				message: ( currentTypeOrSubtype.fields.indexOf( 'message' ) !== -1 ? rememberData.message : '' ),
				image: ( currentTypeOrSubtype.fields.indexOf( 'image' ) !== -1 ? rememberData.image : '' )
			};

			$( '#mw-wikilove-dialog' ).find( '.mw-wikilove-error' ).remove();

			// only show the description if it exists for this type or subtype
			if ( typeof currentTypeOrSubtype.descr === 'string' ) {
				$( '#mw-wikilove-subtype-description' ).show();
			} else {
				$( '#mw-wikilove-subtype-description' ).hide();
			}

			// show or hide header label and textbox depending on fields configuration
			$( '#mw-wikilove-header, #mw-wikilove-header-label' )
				.toggle( currentTypeOrSubtype.fields.indexOf( 'header' ) !== -1 );

			// set the new text for the header textbox
			$( '#mw-wikilove-header' ).val( currentRememberData.header || currentTypeOrSubtype.header || '' );

			// show or hide title label and textbox depending on fields configuration
			$( '#mw-wikilove-title, #mw-wikilove-title-label' )
				.toggle( currentTypeOrSubtype.fields.indexOf( 'title' ) !== -1 );

			// set the new text for the title textbox
			$( '#mw-wikilove-title' ).val( currentRememberData.title || currentTypeOrSubtype.title || '' );

			// show or hide image label and textbox depending on fields configuration
			$( '#mw-wikilove-image, #mw-wikilove-image-label, #mw-wikilove-image-note, #mw-wikilove-commons-text' )
				.toggle( currentTypeOrSubtype.fields.indexOf( 'image' ) !== -1 );

			// set the new text for the image textbox
			$( '#mw-wikilove-image' ).val( currentRememberData.image || currentTypeOrSubtype.image || '' );

			if ( typeof currentTypeOrSubtype.gallery === 'object' &&
				Array.isArray( currentTypeOrSubtype.gallery.imageList )
			) {
				$( '#mw-wikilove-gallery, #mw-wikilove-gallery-label' ).show();
				$.wikiLove.showGallery(); // build gallery from array of images
			} else {
				$( '#mw-wikilove-gallery, #mw-wikilove-gallery-label' ).hide();
			}

			// show or hide message label and textbox depending on fields configuration
			$( '#mw-wikilove-message, #mw-wikilove-message-label, #mw-wikilove-message-note' )
				.toggle( currentTypeOrSubtype.fields.indexOf( 'message' ) !== -1 );

			// set the new text for the message textbox
			$( '#mw-wikilove-message' ).val( currentRememberData.message || currentTypeOrSubtype.message || '' );

			if ( currentTypeOrSubtype.fields.indexOf( 'notify' ) !== -1 && emailable ) {
				$( '#mw-wikilove-notify' ).show();
			} else {
				$( '#mw-wikilove-notify' ).hide();
				$( '#mw-wikilove-notify-checkbox' ).prop( 'checked', false );
			}
		},

		/**
		 * Handler for clicking the preview button.
		 *
		 * @param {jQuery.Event} e Click event
		 * @return {boolean} Event propagates
		 */
		validatePreviewForm: function ( e ) {
			var imageTitle;

			e.preventDefault();
			$( '#mw-wikilove-success' ).hide();
			$( '#mw-wikilove-dialog' ).find( '.mw-wikilove-error' ).remove();
			$( '#mw-wikilove-preview' ).hide();

			// Check for a header if it is required
			if ( currentTypeOrSubtype.fields.indexOf( 'header' ) !== -1 && $( '#mw-wikilove-header' ).val().length === 0 ) {
				$.wikiLove.showAddDetailsError( 'wikilove-err-header' ); return false;
			}

			// Check for a title if it is required, and otherwise use the header text
			if ( currentTypeOrSubtype.fields.indexOf( 'title' ) !== -1 && $( '#mw-wikilove-title' ).val().length === 0 ) {
				$( '#mw-wikilove-title' ).val( $( '#mw-wikilove-header' ).val() );
			}

			if ( currentTypeOrSubtype.fields.indexOf( 'message' ) !== -1 ) {
				// Check for a message if it is required
				if ( $( '#mw-wikilove-message' ).val().length <= 0 ) {
					$.wikiLove.showAddDetailsError( 'wikilove-err-msg' ); return false;
				}
				// If there's a signature already in the message, throw an error
				if ( $( '#mw-wikilove-message' ).val().indexOf( '~~~' ) >= 0 ) {
					$.wikiLove.showAddDetailsError( 'wikilove-err-sig' ); return false;
				}
			}

			// Split image validation depending on whether or not it is a gallery
			if ( typeof currentTypeOrSubtype.gallery === 'undefined' ) { // not a gallery
				if ( currentTypeOrSubtype.fields.indexOf( 'image' ) !== -1 ) { // asks for an image
					if ( $( '#mw-wikilove-image' ).val().length === 0 ) { // no image entered
						// Give them the default image and continue with preview.
						$( '#mw-wikilove-image' ).val( options.defaultImage );
						$.wikiLove.submitPreview();
					} else { // image was entered by user
						// Make sure the image exists
						imageTitle = $.wikiLove.normalizeFilename( $( '#mw-wikilove-image' ).val() );
						$( '#mw-wikilove-preview-spinner' ).fadeIn( 200 );

						api.get( {
							formatversion: 2,
							action: 'query',
							titles: imageTitle,
							prop: 'imageinfo'
						} )
							.done( function ( data ) {
								var page = data.query.pages[ 0 ];
								// See if image exists locally or through InstantCommons
								if ( !page.missing || page.imageinfo ) {
									// Image exists
									$.wikiLove.submitPreview();
								} else {
									// Image does not exist
									$.wikiLove.showAddDetailsError( 'wikilove-err-image-bad' );
									$( '#mw-wikilove-preview-spinner' ).fadeOut( 200 );
								}
							} )
							.fail( function () {
								$.wikiLove.showAddDetailsError( 'wikilove-err-image-api' );
								$( '#mw-wikilove-preview-spinner' ).fadeOut( 200 );
							} );
					}
				} else { // doesn't ask for an image
					$.wikiLove.submitPreview();
				}
			} else { // a gallery
				if ( $( '#mw-wikilove-image' ).val().length === 0 ) { // no image selected
					// Display an error telling them to select an image.
					$.wikiLove.showAddDetailsError( 'wikilove-err-image' ); return false;
				} else { // image was selected
					$.wikiLove.submitPreview();
				}
			}
			return true;
		},

		/**
		 * After the form is validated, perform preview.
		 */
		submitPreview: function () {
			var text = $.wikiLove.prepareMsg( currentTypeOrSubtype.text || options.types[ currentTypeId ].text || options.defaultText );
			$.wikiLove.doPreview( '==' + $( '#mw-wikilove-header' ).val() + '==\n' + text );
		},

		showAddDetailsError: function ( errmsg ) {
			$( '#mw-wikilove-add-details' ).append( $( '<div class="mw-wikilove-error"></div>' ).text( mw.msg( errmsg ) ) );
		},

		showPreviewError: function ( errmsg ) {
			$( '#mw-wikilove-preview' ).append( $( '<div class="mw-wikilove-error"></div>' ).text( mw.msg( errmsg ) ) );
		},

		showSuccessMsg: function ( msg ) {
			$( '#mw-wikilove-success' ).text( msg ).show();
		},

		/**
		 * Prepares a message or e-mail body by replacing placeholders.
		 * $1: message entered by the user
		 * $2: title of the item
		 * $3: title of the image
		 * $4: image size
		 * $5: background color
		 * $6: border color
		 * $7: username of the recipient
		 *
		 * @param {string} msg Message with placeholders
		 * @return {string} Prepared message
		 */
		prepareMsg: function ( msg ) {
			msg = msg.replace( '$1', $( '#mw-wikilove-message' ).val() ); // replace the raw message
			msg = msg.replace( '$2', $( '#mw-wikilove-title' ).val() ); // replace the title
			msg = msg.replace( '$3', $.wikiLove.normalizeFilename( $( '#mw-wikilove-image' ).val() ) ); // replace the image
			msg = msg.replace( '$4', currentTypeOrSubtype.imageSize || options.defaultImageSize ); // replace the image size
			msg = msg.replace( '$5', currentTypeOrSubtype.backgroundColor || options.defaultBackgroundColor ); // replace the background color
			msg = msg.replace( '$6', currentTypeOrSubtype.borderColor || options.defaultBorderColor ); // replace the border color
			msg = msg.replace( '$7', '<nowiki>' + mw.config.get( 'wikilove-recipient', '' ) + '</nowiki>' ); // replace the username we're sending to

			return msg;
		},

		/**
		 * Normalize a filename.
		 * This function will extract a filename from a URL or add a "File:" prefix if there isn't
		 * already a media namespace prefix.
		 *
		 * @param {string} filename Filename or URL from user input
		 * @return {string} Normalized filename with prefix
		 */
		normalizeFilename: function ( filename ) {
			var title = mw.Title.newFromImg( { src: filename } ) || mw.Title.newFromText( filename, mw.config.get( 'wgNamespaceIds' ).file );
			if ( !title ) {
				return filename;
			}
			return title.getPrefixedText();
		},

		/**
		 * Fires AJAX request for previewing wikitext.
		 *
		 * @param {string} wikitext Wikitext to preview
		 */
		doPreview: function ( wikitext ) {
			$( '#mw-wikilove-preview-spinner' ).fadeIn( 200 );
			api.parse( wikitext, {
				prop: 'text',
				disableeditsection: true,
				pst: true
			} )
				.done( function ( html ) {
					$.wikiLove.showPreview( html );
					$( '#mw-wikilove-preview-spinner' ).fadeOut( 200 );
				} )
				.fail( function () {
					$.wikiLove.showAddDetailsError( 'wikilove-err-preview-api' );
					$( '#mw-wikilove-preview-spinner' ).fadeOut( 200 );
				} );
		},

		/**
		 * Callback for the preview function. Sets the preview area with the HTML and fades it in.
		 *
		 * @param {string} html HTML to preview
		 */
		showPreview: function ( html ) {
			$( '#mw-wikilove-preview-area' ).html( html );
			$( '#mw-wikilove-preview' ).fadeIn( 200 );
		},

		/**
		 * Handler for the send (final submit) button. Builds the data for the AJAX request.
		 * The type sent for statistics is 'typeId-subtypeId' when using subtypes,
		 * or simply 'typeId' otherwise.
		 *
		 * @param {jQuery.Event} e Click event
		 * @return {boolean} Event propagates
		 */
		submitSend: function ( e ) {
			var submitData;

			e.preventDefault();
			$( '#mw-wikilove-success' ).hide();
			$( '#mw-wikilove-dialog' ).find( '.mw-wikilove-error' ).remove();

			// Check for a header if it is required
			if ( currentTypeOrSubtype.fields.indexOf( 'header' ) !== -1 && $( '#mw-wikilove-header' ).val().length === 0 ) {
				$.wikiLove.showAddDetailsError( 'wikilove-err-header' ); return false;
			}

			// Check for a title if it is required, and otherwise use the header text
			if ( currentTypeOrSubtype.fields.indexOf( 'title' ) !== -1 && $( '#mw-wikilove-title' ).val().length === 0 ) {
				$( '#mw-wikilove-title' ).val( $( '#mw-wikilove-header' ).val() );
			}

			if ( currentTypeOrSubtype.fields.indexOf( 'message' ) !== -1 ) {
				// If there's a signature already in the message, throw an error
				if ( $( '#mw-wikilove-message' ).val().indexOf( '~~~' ) >= 0 ) {
					$.wikiLove.showAddDetailsError( 'wikilove-err-sig' ); return false;
				}
			}

			// We don't need to do any image validation here since its not actually possible to click
			// Send WikiLove without having a valid image entered.

			submitData = {
				header: $( '#mw-wikilove-header' ).val(),
				text: $.wikiLove.prepareMsg( currentTypeOrSubtype.text || options.types[ currentTypeId ].text || options.defaultText ),
				message: $( '#mw-wikilove-message' ).val(),
				type: currentTypeId + ( currentSubtypeId !== null ? '-' + currentSubtypeId : '' )
			};
			if ( $( '#mw-wikilove-notify-checkbox:checked' ).val() && emailable ) {
				submitData.email = $.wikiLove.prepareMsg( currentTypeOrSubtype.email );
			}
			$.wikiLove.doSend( submitData.header, submitData.text,
				submitData.message, submitData.type, submitData.email );
			return true;
		},

		/**
		 * Fires the final AJAX request and then redirects to the talk page where the content is added.
		 *
		 * @param {string} subject Subject
		 * @param {string} wikitext Wikitext
		 * @param {string} message Message
		 * @param {string} type Type ID
		 * @param {string} email E-mail
		 */
		doSend: function ( subject, wikitext, message, type, email ) {
			var targetBaseUrl, currentBaseUrl,
				wikiLoveNumberAttempted = 0,
				wikiLoveNumberPosted = 0;

			$( '#mw-wikilove-send-spinner' ).fadeIn( 200 );

			// If the talk page is not a Wikitext page, remove the signature
			if ( mw.config.get( 'wgPageContentModel' ) !== 'wikitext' ) {
				wikitext = wikitext.replace( /\s*~~~~/, '' );
			}

			$.each( targets, function ( index, target ) {
				var sendData = {
					action: 'wikilove',
					title: 'User:' + target,
					type: type,
					text: wikitext,
					message: message,
					subject: subject
				};

				if ( email ) {
					sendData.email = email;
				}
				api.postWithToken( 'csrf', sendData )
					.done( function ( data ) {
						wikiLoveNumberAttempted++;
						if ( wikiLoveNumberAttempted === targets.length ) {
							$( '#mw-wikilove-send-spinner' ).fadeOut( 200 );
						}

						if ( data.error !== undefined ) {
							if ( data.error.info === 'Invalid token' ) {
								$.wikiLove.showPreviewError( 'wikilove-err-invalid-token' );
							} else {
								$.wikiLove.showPreviewError( 'wikilove-err-send-api' );
							}
							return;
						}

						if ( data.redirect !== undefined ) {
							wikiLoveNumberPosted++;
							if ( redirect ) {
								targetBaseUrl = mw.util.getUrl( data.redirect.pageName );
								// currentBaseUrl is the current URL minus the hash fragment
								currentBaseUrl = location.href.split( '#' )[ 0 ];

								// Set window location to user talk page URL + WikiLove anchor hash.
								// Unfortunately, in the most common scenario (starting from the user talk
								// page) this won't reload the page since the browser will simply try to jump
								// to the anchor within the existing page (which doesn't exist). This does,
								// however, prepare us for the subsequent reload, making sure that the user is
								// directed to the WikiLove message instead of just being left at the top of
								// the page. In the case that we are starting from a different page, this sends
								// the user immediately to the new WikiLove message on the user talk page.
								location.href = targetBaseUrl + '#' + data.redirect.fragment; // data.redirect.fragment is already encoded

								// If we were already on the user talk page, then reload the page so that the
								// new WikiLove message is displayed.
								// @todo: an expandUrl() would be very nice indeed!
								if (
									mw.config.get( 'wgServer' ) + targetBaseUrl === currentBaseUrl ||
									// Compatibility with protocol-relative URLs in MediaWiki 1.18+
									location.protocol + mw.config.get( 'wgServer' ) + targetBaseUrl === currentBaseUrl
								) {
									location.reload();
								}
							} else {
								$.wikiLove.showSuccessMsg( mw.msg( 'wikilove-success-number', wikiLoveNumberPosted ) );
								// If there were no errors, close the dialog and reset WikiLove
								if ( wikiLoveNumberPosted === targets.length ) {
									setTimeout( function () {
										$dialog.dialog( 'close' );
										$.wikiLove.reset();
									}, 1000 );
								}
							}
						} else { // API did not return appropriate information
							$.wikiLove.showPreviewError( 'wikilove-err-send-api' );
						}
					} )
					.fail( function () {
						$.wikiLove.showPreviewError( 'wikilove-err-send-api' );
						wikiLoveNumberAttempted++;
						if ( wikiLoveNumberAttempted === targets.length ) {
							$( '#mw-wikilove-send-spinner' ).fadeOut( 200 );
						}
					} );
			} );
		},

		/**
		 * Resets WikiLove to its itialized state – removes the dialog box from the
		 * DOM and resets the pseudo-global variables.
		 */
		reset: function () {
			$dialog.dialog( 'destroy' );
			$( '#mw-wikilove-dialog' ).remove();
			$dialog = null;
			currentTypeId = null;
			currentSubtypeId = null;
			currentTypeOrSubtype = null;
			rememberData = null;
		},

		/**
		 * This function is called if the gallery is an array of images. It retrieves the image
		 * thumbnails from the API, and constructs a thumbnail gallery with them.
		 */
		showGallery: function () {
			var i, id, index, loadingType, loadingIndex, galleryNumber, $img,
				titles = [],
				imageList = currentTypeOrSubtype.gallery.imageList.slice();

			$( '#mw-wikilove-gallery-content' ).html( '' );
			gallery = {};
			$( '#mw-wikilove-gallery-spinner' ).fadeIn( 200 );
			$( '#mw-wikilove-gallery-error' ).hide();

			if (
				currentTypeOrSubtype.gallery.number === undefined ||
				currentTypeOrSubtype.gallery.number <= 0
			) {
				currentTypeOrSubtype.gallery.number = currentTypeOrSubtype.gallery.imageList.length;
			}

			for ( i = 0; i < currentTypeOrSubtype.gallery.number; i++ ) {
				// get a random image from imageList and add it to the list of titles to be retrieved
				id = Math.floor( Math.random() * imageList.length );
				titles.push( $.wikiLove.normalizeFilename( imageList[ id ] ) );

				// remove the randomly selected image from imageList so that it can't be added twice
				imageList.splice( id, 1 );
			}

			index = 0;
			loadingType = currentTypeOrSubtype;
			loadingIndex = 0;
			api.post( {
				formatversion: 2,
				action: 'query',
				prop: 'imageinfo',
				iiprop: 'mime|url',
				titles: titles,
				iiurlwidth: currentTypeOrSubtype.gallery.width,
				iiurlheight: currentTypeOrSubtype.gallery.height
			} )
				.done( function ( data ) {
					if ( !data || !data.query || !data.query.pages ) {
						$( '#mw-wikilove-gallery-error' ).show();
						$( '#mw-wikilove-gallery-spinner' ).fadeOut( 200 );
						return;
					}

					if ( loadingType !== currentTypeOrSubtype ) {
						return;
					}
					galleryNumber = currentTypeOrSubtype.gallery.number;

					data.query.pages.forEach( function ( page ) {
						if ( page.imageinfo && page.imageinfo.length ) {
							// build an image tag with the correct url
							$img = $( '<img>' )
								.attr( 'src', page.imageinfo[ 0 ].thumburl )
								.hide()
								.on( 'load', function () {
									$( this ).css( 'display', 'inline-block' );
									loadingIndex++;
									if ( loadingIndex >= galleryNumber ) {
										$( '#mw-wikilove-gallery-spinner' ).fadeOut( 200 );
									}
								} );
							$( '#mw-wikilove-gallery-content' ).append(
								$( '<a href="#"></a>' )
									.attr( 'id', 'mw-wikilove-gallery-img-' + index )
									.append( $img )
									.on( 'click', function ( e ) {
										e.preventDefault();
										$( '#mw-wikilove-gallery a' ).removeClass( 'selected' );
										$( this ).addClass( 'selected' );
										$( '#mw-wikilove-image' ).val( gallery[ $( this ).attr( 'id' ) ] );
									} )
							);
							gallery[ 'mw-wikilove-gallery-img-' + index ] = page.title;
							index++;
						}
					} );
					// Pre-select first image
					/* $( '#mw-wikilove-gallery-img-0 img' ).trigger( 'click' ); */
				} )
				.fail( function () {
					$( '#mw-wikilove-gallery-error' ).show();
					$( '#mw-wikilove-gallery-spinner' ).fadeOut( 200 );
				} );
		},

		/**
		 * Init function which is called upon page load. Binds the WikiLove icon to opening the dialog.
		 */
		init: function () {
			var $wikiLoveLink = $( [] );
			options = $.wikiLoveOptions;

			if ( $( '#ca-wikilove' ).length ) {
				$wikiLoveLink = $( '#ca-wikilove' ).find( 'a' );
			} else { // legacy skins
				$wikiLoveLink = $( '#topbar a:contains(' + mw.msg( 'wikilove-tab-text' ) + ')' );
			}
			$wikiLoveLink.off( 'click' );
			$wikiLoveLink.on( 'click', function ( e ) {
				e.preventDefault();
				$.wikiLove.openDialog();
			} );
		}

		/**
		 * This is a bit of a hack to show some random images. A predefined set of image infos are
		 * retrieved using the API. Then we randomise this set ourselves and select some images to
		 * show. Eventually we probably want to make a custom API call that does this properly and
		 * also allows for using remote galleries such as Commons, which is now prohibited by JS.
		 *
		 * For now this function is disabled. It also shares code with the current gallery function,
		 * so when enabling it again it should be implemented cleaner with a custom API call, and
		 * without duplicate code between functions
		 */
		/*
		makeGallery: function () {
			$( '#mw-wikilove-gallery-content' ).html( '' );
			gallery = {};
			$( '#mw-wikilove-gallery-spinner' ).fadeIn( 200 );

			$.ajax( {
				url: mw.config.get( 'wgServer' ) + mw.config.get( 'wgScriptPath' ) + '/api.php?',
				data: {
					action: 'query',
					format: 'json',
					prop: 'imageinfo',
					iiprop: 'mime|url',
					iiurlwidth: currentTypeOrSubtype.gallery.width,
					generator: 'categorymembers',
					gcmtitle: currentTypeOrSubtype.gallery.category,
					gcmnamespace: 6,
					gcmsort: 'timestamp',
					gcmlimit: currentTypeOrSubtype.gallery.total
				},
				dataType: 'json',
				type: 'POST',
				success: function ( data ) {
					var keys, i, id, page, $img;

					// clear
					$( '#mw-wikilove-gallery-content' ).html( '' );
					gallery = {};

					// if we have any images at all
					if ( data.query ) {
						// get the page keys which are just ids
						keys = Object.keys( data.query.pages );

						// try to find "num" images to show
						for ( i = 0; i < currentTypeOrSubtype.gallery.num; i++ ) {
							// continue looking for a new image until we have found one thats valid
							// or until we run out of images
							while ( keys.length > 0 ) {
								// get a random page
								id = Math.floor( Math.random() * keys.length );
								page = data.query.pages[ keys[ id ] ];

								// remove the random page from the keys array
								keys.splice( id, 1 );

								// only add the image if it's actually an image
								if ( page.imageinfo[ 0 ].mime.slice( 0, 5 ) === 'image' ) {
									// build an image tag with the correct url and width
									$img = $( '<img>' )
										.attr( 'src', page.imageinfo[ 0 ].url )
										.attr( 'width', currentTypeOrSubtype.gallery.width )
										.hide()
										.on( 'load', function () { $( this ).css( 'display', 'inline-block' ); } );

									// append the image to the gallery and also make sure it's selectable
									$( '#mw-wikilove-gallery-content' ).append(
										$( '<a href="#"></a>' )
											.attr( 'id', 'mw-wikilove-gallery-img-' + i )
											.append( $img )
											// eslint-disable-next-line no-loop-func
											.on( 'click', function ( e ) {
												e.preventDefault();
												$( '#mw-wikilove-gallery a' ).removeClass( 'selected' );
												$( this ).addClass( 'selected' );
												$( '#mw-wikilove-image' ).val( gallery[ $( this ).attr( 'id' ) ] );
											} )
									);

									// save the page title into an array so we know which image id maps to which title
									gallery[ 'mw-wikilove-gallery-img-' + i ] = page.title;
									break;
								}
							}
						}
					}
					if ( gallery.length === 0 ) {
						$( '#mw-wikilove-gallery' ).hide();
						$( '#mw-wikilove-gallery-label' ).hide();
					}

					$( '#mw-wikilove-gallery-spinner' ).fadeOut( 200 );
				}
			} );
		},
		*/
	};

	$( $.wikiLove.init );
}( jQuery, mediaWiki ) );
