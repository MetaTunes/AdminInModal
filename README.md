# AdminInModal
A module for ProcessWire CMS/CMF. Allows display and customisation of admin page in front end as well as back end via a modal.
Tested in Windows and IOS envrionments.

The module provides a Page hook method ($page->aim($array)) for front-end use and a similar Inputfield hook (for back-end use: $inputfield->aim($array)) to render a link to a lightbox modal containing an admin page.

Optionally, class styling can be passed in the array, otherwise default button styling is supplied.
Minimally, you need to supply the 'href' and 'text' options in the array.

Full list of options and defaults for the array is :

	*   'href' => null, // the url for the linked page (including any required GET params)
    *   'text' => '##',  // the text that will appear in the link
    *   'class' => "uk-button uk-button-primary", // any suitable styling for an <a> tag
	*   'width' => '90%', // size for iframe
	*   'height' => '95%',
    *   'header-text' => 'Save required changes before closing -->', // Text to appear above top left of modal
    *   'save-head-button' => '1', // Adds a save button at the top of the modal. Set to '0' to omit.
	*   'suppress-notices' => 'messages', // e.g. null/[]: no suppression, 'messages': suppress messages, 'warnings messages': suppress warnings & messages, 'errors': suppress errors
    *   'close-button' => '1', // set to '0' to remove close button (but you'd better be sure you know how the modal will be closed!)
    *   'redirect' => '.', // url to redirect to after closing the modal - default is to reload the current page (use redirect => '' to suppress). Use '#divid' to scroll to a specific div on current page

From v0.3.0, these defaults can be changed in the module config settings.

For front-end use, the lightbox will only be rendered if the page is editable by the current user.

Configure editability of the page by calling a hook after User::hasPagePermission

The lightbox is provided by the Magnific popup, which is in the PW core.

This code has not been fully tested and should be used with care. It is the user's responsibility to check that it suits their needs.
Because it allows access to the admin back-end, particular care should be taken to restrict page-edit access.
