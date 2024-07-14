<?php namespace ProcessWire;

/*
 * This module provides a Page hook method ($page->aim($array)) for front-end use and a similar Inputfield hook (for back-end use)
 * to render a link to a lightbox modal containing an admin page.
 * Optionally, class styling can be passed, otherwise default button styling is supplied.
 * Full list of options and defaults for the array is :
 *       $defaults = [
			'href' => null, // the url for the linked page (including any required GET params)
            'text' => '##',  // the text that will appear in the link
            'class' => "uk-button uk-button-primary", // any suitable styling for an <a> tag
			'width' => '90%', // size for iframe
			'height' => '95%',
			'header-text' => 'Save required changes before closing -->', // Text to appear above top left of modal
			'save-head-button' => '1', // Adds a save button at the top of the modal. Set to '0' to omit.
			'suppress-notices' => 'messages', // e.g. null/[]: no suppression, 'messages': suppress messages, 'warnings messages': suppress warnings & messages, 'errors': suppress errors
        	'close-button' => '1', // set to '0' to remove close button (but you'd better be sure you know how the modal will be closed!)
			'redirect' => '.', // url to redirect to after closing the modal - default is to reload the current page (use redirect => '' to suppress)
        ];
 * The lightbox will only be rendered if the page is editable by the current user.
 */
class AdminInModal extends WireData implements Module
{

    public static function getModuleinfo() {
        return [
            'title' => 'Admin in modal (aim)',
            'summary' => 'Provides hook for admin lightbox in front end as well as back end.',
            'author' => 'Mark Evens',
            'version' => '0.2.5',
            'autoload'  => true,
            'singular'  => true,
            'permanent' => false,
        ];
    }

	public function init() {

	}


    /**
     * Create the hook
     * @throws WireException
     */
    public function ready() {
		// Add scripts and styles in the back end
		// Admin should have already added JqueryCore
		$this->wire()->config->scripts->append($this->wire()->urls->modules . "Jquery/JqueryMagnific/JqueryMagnific.js");
		$this->wire()->config->styles->add($this->wire()->urls->modules . "Jquery/JqueryMagnific/JqueryMagnific.css");
		$this->wire()->config->scripts->add($this->wire()->urls->siteModules . 'AdminInModal/AdminInModal.js');
		$this->wire()->config->styles->add($this->wire()->urls->siteModules . "AdminInModal/AdminInModal.css");
		// Add scripts & styles in the front end (see https://processwire.com/talk/topic/4472-how-to-insert-scripts-and-stylesheets-from-your-module/ )
		$this->addHookAfter('Page::render', $this, 'addScripts');
		// Add the main 'aim' methods
		$this->addHook('Page::aim', $this, 'addBox');
		$this->addHook('Inputfield::aim', $this, 'addBox');
    }

    /**
     * Display relevant fancybox
     * @param HookEvent $event
     */
    public function addBox(HookEvent $event) {
//        wire()->log->save('debug', 'In "Admin in modal" ');
        $settings = $event->arguments(0);  // an array
        $defaults = [
			'href' => null, // the url for the linked page (including any required GET params)
            'text' => '##',  // the text that will appear in the link
            'class' => "uk-button uk-button-primary", // any suitable styling for an <a> tag
			'width' => '90%', // size for iframe
			'height' => '95%',
			'header-text' => 'Save required changes before closing -->', // Text to appear above top left of modal
			'save-head-button' => '1', // Adds a save button at the top of the modal. Set to '0' to omit.
			'suppress-notices' => 'messages warnings errors', // e.g. null/[]: no suppression, 'messages': suppress messages, 'warnings messages': suppress warnings & messages, 'errors': suppress errors
        	'close-button' => '1', // set to '0' to remove close button (but you'd better be sure you know how the modal will be closed!)
			'redirect' => '.', // url to redirect to after closing the modal - default is to reload the current page (use redirect => '' to suppress)
		];
		if(!$settings) {
			$settings = $defaults;
		} else {
			foreach($defaults as $key => $default) {
				if(!key_exists($key, $settings)) $settings[$key] = $defaults[$key];
			}
		}
		if(!$settings['href']) return;

        $currentUser = $this->user;
		if($event->object instanceof Page) {
			// For front-end access, check the user is still logged in
			if($currentUser->isLoggedin()) {
				$pageLink = $this->setPageLink($settings);
				$box = '<a class="' . $settings["class"] . ' magnific-modal"' . ' data-mfp-src="' . $pageLink . '" data-aim-width="' . $settings["width"] .
					'" data-aim-height="' . $settings["height"] . '" data-header-text="' . $settings["header-text"] . '" data-save-head-button="' . $settings["save-head-button"]
					. '" data-suppress-notices="' . $settings["suppress-notices"] . '" data-close-button="' . $settings["close-button"] . '" data-redirect="' . $settings["redirect"] . '">' .
					$settings["text"] . '</a>';
				$event->return = $box;
				//bd($box, 'box');
			} else {
				wire()->log->save('debug', 'AdminInModal: Unable to show admin modal - access denied');
			}
		} else if($event->object instanceof Inputfield) {
			$f = $event->object;
			$pageLink = $this->setPageLink($settings);
			$f->attr('data-mfp-src', $pageLink);
			$f->attr('data-aim-width', $settings['width']);
			$f->attr('data-aim-height', $settings['height']);
			$f->attr('data-save-head-button', $settings['save-head-button']);
			$f->attr('data-suppress-notices', $settings['suppress-notices']);
			$f->attr('data-header-text', $settings['header-text']);
			$f->attr('data-close-button', $settings['close-button']);
			$f->attr('data-redirect', $settings['redirect']);
			$f->addClass("magnific-modal");
			$event->return = $f;
		}
    }

	public function addScripts($event) {
		$page = $event->object;

		// don't add this to the admin pages
		if($page->template == 'admin') return;

		//other mechanisms to ensure the script only loads when this module was called in the front-end?

		$additionalHeadScripts = '<!-- Additional scripts & styles for AdminInModal -->' .
			'<script src="' . urls()->modules . 'Jquery/JqueryCore/JqueryCore.js"></script>' .
			'<script src="' . urls()->modules . 'Jquery/JqueryMagnific/JqueryMagnific.js"></script>' .
			'<link rel="stylesheet" href="' . urls()->modules . 'Jquery/JqueryMagnific/JqueryMagnific.css">' .
			'<script src="' . urls()->siteModules . 'AdminInModal/AdminInModal.js"></script>' .
			'<link rel="stylesheet" href="' . urls()->siteModules . 'AdminInModal/AdminInModal.css">';

		//bd($additionalHeadScripts, 'additionalHeadScripts');

		$event->return = str_replace("</head>", $additionalHeadScripts . '</head>', $event->return);
	}

	private function setPageLink($settings) {
		$pageLink = ($settings['href']) ?? pages()->get('/http404/')->url; // default to 404
		$pageLink = (strpos($pageLink, '?')) ? str_replace('?', "?aim-mfp=1&modal=1&", $pageLink) : $pageLink . "?aim-mfp=1&modal=1";
		return $pageLink;
	}

}