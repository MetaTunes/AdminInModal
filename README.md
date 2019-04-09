# AdminInModal
A module for ProcessWire CMS/CMF. Allows display of admin page in front end via a modal in iframe in fancybox lightbox.

This module provides a Page hook method to render a link to a lightbox modal containing an admin page. 
Call the method with $page->aim($array). The method can be in "add" or "edit" mode. In "add" mode the Page object will be the parent page of the one to be added and a template name can be passed in the array to restrict the template for the type of page to be added. In "edit" mode (the default), the Page object is the page to be edited. Optionally, class styling can be passed, otherwise default button styling is supplied.

Full list of options and defaults for the array is :

* 'mode' => 'page-edit', // or page-add
* 'text' => '##', // the text that will appear in the link 
* 'template' => '', // template for use with page-add 
* 'open' => '', // a parameter that may be passed as a GET variable to the admin page
* 'class' => "uk-button uk-button-primary" The lightbox will only be rendered if the page is editable by the current user.

Configure editability of the page by calling a hook after User::hasPagePermission

This code has not been fully tested and should be used with care. It is the user's responsibility to check that it suits their needs.
Because it allows access to the admin back-end, particular care should be taken to restrict page-edit and page-add access.
