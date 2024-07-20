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
class AdminInModal extends WireData implements Module, ConfigurableModule
{

    public static function getModuleInfo() {
        return [
            'title' => 'Admin in modal (aim)',
            'summary' => 'Provides hook for admin lightbox in front end as well as back end.',
            'author' => 'Mark Evens',
            'version' => '0.3.0',
            'autoload'  => true,
            'singular'  => true,
            'permanent' => false,
        ];
    }

	/**
	 * Set default values for configuration settings
	 */
	public function setDefaults() {
		return [
			'href' => null, // the url for the linked page (including any required GET params)
			'text' => '##',  // the text that will appear in the link
			'class' => "uk-button uk-button-primary", // any suitable styling for an <a> tag
			'width' => '90%', // size for iframe
			'height' => '95%',
			'headerText' => 'Save required changes before closing -->', // Text to appear above top left of modal
			'saveHeadButton' => '1', // Adds a save button at the top of the modal. Set to '0' to omit.
			'suppressNotices' => 'messages warnings errors', // e.g. null/[]: no suppression, 'messages': suppress messages, 'warnings messages': suppress warnings & messages, 'errors': suppress errors
			'closeButton' => '1', // set to '0' to remove close button (but you'd better be sure you know how the modal will be closed!)
			'redirect' => '.', // url to redirect to after closing the modal - default is to reload the current page (use redirect => '' to suppress)
			'overridePwModal' => '1', // set to '0' to use the standard ProcessWire modal unless aim() is specifically called
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
		$this->wire()->config->scripts->add($this->wire()->urls->siteModules . basename(__DIR__) . '/AdminInModal.js');
		$this->wire()->config->styles->add($this->wire()->urls->siteModules . basename(__DIR__) . "/AdminInModal.css");
		// Add scripts & styles in the front end (see https://processwire.com/talk/topic/4472-how-to-insert-scripts-and-stylesheets-from-your-module/ )
		$this->addHookAfter('Page::render', $this, 'addScripts');
		// Add the main 'aim' methods
		$this->addHook('Page::aim', $this, 'addBox');
		$this->addHook('Inputfield::aim', $this, 'addBox');
		//Removed below as not currently used
//		$modules = $this->wire()->modules;
//		$settings = $modules->getConfig($this);
//		$this->wire()->config->js('AdminInModal', $settings);
    }

    /**
     * Display relevant fancybox
     * @param HookEvent $event
     */
    public function addBox(HookEvent $event) {
//        wire()->log->save('debug', 'In "Admin in modal" ');
		$modules = $this->wire()->modules;
        $settings = $event->arguments(0);  // an array
        $defaults = ($modules->getConfig($this)) ?
		[
			'href' => null, // the url for the linked page (including any required GET params)
			'text' => $this->text,  // the text that will appear in the link
			'class' => $this->class, // any suitable styling for an <a> tag
			'width' => $this->width, // size for iframe
			'height' => $this->height,
			'headerText' => $this->headerText, // Text to appear above top left of modal
			'saveHeadButton' => $this->saveHeadButton, // Adds a save button at the top of the modal. Set to '0' to omit.
			'suppressNotices' => $this->suppressNotices, // e.g. null/[]: no suppression, 'messages': suppress messages, 'warnings messages': suppress warnings & messages, 'errors': suppress errors
			'closeButton' => $this->closeButton, // set to '0' to remove close button (but you'd better be sure you know how the modal will be closed!)
			'redirect' => $this->redirect, // url to redirect to after closing the modal - default is to reload the current page (use redirect => '' to suppress)
		]
		: $this->setDefaults();
		//bd($defaults, 'defaults');
		if(!$settings) {
			$settings = $defaults;
		} else {
			foreach($defaults as $key => $default) {
				if(!key_exists($key, $settings)) $settings[$key] = $defaults[$key];
			}
		}
		if(!$settings['href']) return;
//bd($settings, 'settings');
        $currentUser = $this->user;
		if($event->object instanceof Page) {
			// For front-end access, check the user is still logged in
			if($currentUser->isLoggedin()) {
				$pageLink = $this->setPageLink($settings);
				$box = '<a class="' . $settings["class"] . ' magnific-modal"' . ' data-mfp-src="' . $pageLink . '" data-aim-width="' . $settings["width"] .
					'" data-aim-height="' . $settings["height"] . '" data-header-text="' . $settings["headerText"] . '" data-save-head-button="' . $settings["saveHeadButton"]
					. '" data-suppress-notices="' . $settings["suppress-notices"] . '" data-close-button="' . $settings["closeButton"] . '" data-redirect="' . $settings["redirect"] . '">' .
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
			$f->attr('data-save-head-button', $settings['saveHeadButton']);
			$f->attr('data-suppress-notices', $settings['suppressNotices']);
			$f->attr('data-header-text', $settings['headerText']);
			$f->attr('data-close-button', $settings['closeButton']);
			$f->attr('data-redirect', $settings['redirect']);
			$f->addClass("magnific-modal");
			$event->return = $f;
		}
    }

	public function addScripts($event) {
		$page = $event->object;

		// don't add this to the admin pages
		if($page->template == 'admin') return;


			$additionalHeadScripts = '<!-- Additional scripts & styles for AdminInModal -->' .
				'<script src="' . urls()->modules . 'Jquery/JqueryCore/JqueryCore.js"></script>' .
				'<script src="' . urls()->modules . 'Jquery/JqueryMagnific/JqueryMagnific.js"></script>' .
				'<link rel="stylesheet" href="' . urls()->modules . 'Jquery/JqueryMagnific/JqueryMagnific.css">' .
				'<script src="' . urls()->siteModules . basename(__DIR__) . '/AdminInModal.js"></script>' .
				'<link rel="stylesheet" href="' . urls()->siteModules . basename(__DIR__) . '/AdminInModal.css">';
		//bd($additionalHeadScripts, 'additionalHeadScripts');

		$event->return = str_replace("</head>", $additionalHeadScripts . '</head>', $event->return);
	}

	private function setPageLink($settings) {
		$pageLink = ($settings['href']) ?? pages()->get('/http404/')->url; // default to 404
		$pageLink = (strpos($pageLink, '?')) ? str_replace('?', "?aim-mfp=1&modal=1&", $pageLink) : $pageLink . "?aim-mfp=1&modal=1";
		return $pageLink;
	}
	public function getModuleConfigInputfields(InputfieldWrapper $inputfields) {
		$modules = $this->wire()->modules;
		$data = array_merge($this->setDefaults(), $modules->getConfig($this));

		/* @var InputfieldText $f */
		$f = $modules->InputfieldText;
		$f->attr('name', 'text');
		$f->label = 'Text for link';
		$f->description = 'The text that will appear in the link';
		$f->notes = 'This will normally be given by the button.';
		$f->value = $data['text'];
		$inputfields->add($f);

		/* @var InputfieldText $f */
		$f = $modules->InputfieldText;
		$f->attr('name', 'class');
		$f->label = 'Class for link';
		$f->description = 'Any suitable styling for an <a> tag';
		$f->value = $data['class'];
		$inputfields->add($f);

		/* @var InputfieldText $f */
		$f = $modules->InputfieldText;
		$f->attr('name', 'width');
		$f->label = 'Width for iframe';
		$f->notes = 'e.g. 90%';
		$f->value = $data['width'];
		$inputfields->add($f);

		/* @var InputfieldText $f */
		$f = $modules->InputfieldText;
		$f->attr('name', 'height');
		$f->label = 'Height for iframe';
		$f->notes = 'e.g. 95%';
		$f->value = $data['height'];
		$inputfields->add($f);

		/* @var InputfieldText $f */
		$f = $modules->InputfieldText;
		$f->attr('name', 'headerText');
		$f->label = 'Text for header';
		$f->description = 'Text to appear above top left of modal';
		$f->value = $data['headerText'];
		$inputfields->add($f);

		/* @var InputfieldCheckbox $f */
		$f = $modules->InputfieldCheckbox;
		$f->attr('name', 'saveHeadButton');
		$f->label = 'Save button at top';
		$f->description = 'Adds a save button at the top of the modal.';
		$f->value = $data['saveHeadButton'];
		$f->checked = ($f->value == 1) ? 'checked' : '';
		$inputfields->add($f);

		/* @var InputfieldText $f */
		$f = $modules->InputfieldText;
		$f->attr('name', 'suppressNotices');
		$f->label = 'Suppress notices';
		$f->description = 'Suppress messages, warnings or errors inside the modal';
		$f->notes = 'e.g. blank: no suppression, "messages": suppress messages, "warnings messages": suppress warnings & messages, "errors": suppress errors';
		$f->value = $data['suppressNotices'];
		$inputfields->add($f);

		/* @var InputfieldCheckbox $f */
		$f = $modules->InputfieldCheckbox;
		$f->attr('name', 'closeButton');
		$f->label = 'Close button';
		$f->description = 'Uncheck to remove close button (but you\'d better be sure you know how the modal will be closed!)';
		$f->value = $data['closeButton'];
		$f->checked = ($f->value == 1) ? 'checked' : '';
		$inputfields->add($f);

		/* @var InputfieldText $f */
		$f = $modules->InputfieldText;
		$f->attr('name', 'redirect');
		$f->label = 'Redirect after close';
		$f->description = 'URL to redirect to after closing the modal - use . to reload the current page or blank to suppress reloading';
		$f->value = $data['redirect'];
		$inputfields->add($f);
	}

}