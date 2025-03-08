# AdminInModal
A module for ProcessWire CMS/CMF. Allows display and customisation of admin page in front end as well as back end via a modal.
Tested in Windows and IOS envrionments.

The module provides a Page hook method (```$page->aim($array)```) for front-end use and a similar Inputfield hook (for back-end use: ```$inputfield->aim($array)```) to render a link to a lightbox modal containing an admin page.
If you wish to use it in the back end outside of an Inputfield context, you can create a new page ```$p = new Page()``` and use the ```$p->aim($array)``` method.

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
    *   'breakout-button' => '0', // Adds a breakout button at the top of the modal (to enable break out into full page). Set to '1' to include.
	*   'suppress-notices' => 'messages', // e.g. null/[]: no suppression, 'messages': suppress messages, 'warnings messages': suppress warnings & messages, 'errors': suppress errors
    *   'close-button' => '1', // set to '0' to remove close button (but you'd better be sure you know how the modal will be closed!)
    *   'close-on-save' => 'no',  // "no": no close-on-save, "":  allow, but any error, warning or message will prevent close-on-save,
                                  // "messages": allow close if there are only messages, "errors warnings messages": always close regardless of notices
                                  // If "add" is included in the list, then the popup will close on save if it is a page add operation, otherwise it will remain open to edit  
    *   'redirect' => '.', // url to redirect to after closing the modal - default is to reload the current page (use redirect => '' to suppress). Use '#divid' to scroll to a specific div on current page

From v0.3.0, these defaults can be changed in the module config settings.

Note that suppress-notices and close-on-save options should be consistent. Do not suppress notices which will cause 
close-on-save to be avoided. For example, if you suppress errors and you want to avoid close-on-save in case of errors 
(e.g. by using 'close-on-save' => 'messages warnings'), then the user will not see why the
close has not occurred.

v0.4.0 adds the ability to break out of the modal into a full page view. 
This is useful for admins who might require full page access but should not be used when the modal is called from the front end.

For front-end use, the lightbox will only be rendered if the page is editable by the current user.

Configure editability of the page by calling a hook after User::hasPagePermission

The lightbox is provided by the Magnific popup, which is in the PW core.

This code has not been fully tested and should be used with care. It is the user's responsibility to check that it suits their needs.
Because it allows access to the admin back-end, particular care should be taken to restrict page-edit access.
