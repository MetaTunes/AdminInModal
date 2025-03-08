$(document).ready(function ($) {
    /*
    Not sure why we need to add ' $' as an argument to the function, but it seems to be necessary
    See https://stackoverflow.com/questions/40218341/typeerror-magnificpopup-is-not-a-function
     */

    var $iframe;
    var noClose = false;

    /*
    Enable magnific popup when clicked
     */
    $('.magnific-modal').on('click', function (event) {
        event.preventDefault(); // prevent the default action
        $(this).addClass('mfp-iframe'); // add the class to the clicked element
        $(this).magnificPopup({
            // src: '#' + ProcessWire.config.aim.pageId,
            type: 'iframe',
            iframe: {
                markup: '<div id="aim-header" style="position: absolute; top: -20px; color:white;"></div>' +
                    '<div id="aim-mfp" class="mfp-iframe-scaler">' +  //aim-mfd id is set to enable other js to test if we are in AdminInModal context
                    '<div class="mfp-close"></div>' +
                    '<iframe class="mfp-iframe"  allowfullscreen>' +
                    '</iframe>' +
                    '</div>', // HTML markup of popup, `mfp-close` will be replaced by the close button
            },
            closeOnBgClick: false,
            closeBtnInside: true,
            callbacks: {
                open: function () {
                    //  console.log('Popup opened', $.magnificPopup.instance);
                    // console.log('Contents', $.magnificPopup.instance.content);
                    // console.log('iframe', $.magnificPopup.instance.content.find('iframe'));
                    if($.magnificPopup && $.magnificPopup.instance.content) {
                        $iframe = $.magnificPopup.instance.content.find('iframe');
                        onLoadIframe();
                        // onSubmit();
                        }
                    sessionStorage.setItem('closeOnSaveReady', 'false');  // reset the closeOnSaveReady flag
                    // console.log('closeOnSaveReady 0', sessionStorage.getItem('closeOnSaveReady'));
                },
            },
        });

        /*
        Set popup to size determined by params
         */
        $(this).on('mfpOpen', function (event) {
            // console.log($(this).data('aim-width'), 'opening');
            // console.log('Popup opened', $.magnificPopup.instance);
            // console.log('Data in open', $(this).data());
            let width = $(this).data('aim-width');
            let height = $(this).data('aim-height');
            let addSaveHead = $(this).data('save-head-button');
            let breakOut = $(this).data('breakout-button');
            let suppressNotices = $(this).data('suppress-notices');
            let headerText = $(this).data('header-text');
            let closeButton = $(this).data('close-button');
            let closeOnSave = $(this).data('close-on-save');
            // console.log('closeOnSave', closeOnSave);
            $.magnificPopup.instance.contentContainer.attr({'style': 'width: ' + width + ' !important; height: ' + height + ' !important;'});
            $.magnificPopup.instance.content.attr({'save-head-button': addSaveHead});
            $.magnificPopup.instance.content.attr({'breakout-button': breakOut});
            $.magnificPopup.instance.content.attr({'suppress-notices': suppressNotices});
            $.magnificPopup.instance.content.attr({'close-on-save': closeOnSave});
            $.magnificPopup.instance.content.prepend("<div>" + headerText + "</div>")
            if (closeButton == '0') {
                $.magnificPopup.instance.currTemplate.closeBtn.remove();
            }
        });

        /*
        Redirect after close
         */
        $(this).on('mfpClose', function (event) {
            // console.log('Redirect', $(this).data('redirect'));
            // console.log('location.href', window.location.href);
            // console.log('location.protocol', window.location.protocol);
            // console.log('location.hostname', window.location.hostname);
            sessionStorage.removeItem('closeOnSaveReady');
            if ($(this).data('redirect')) {
                const redirect = $(this).data('redirect');
                if (window.location.href === window.location.protocol + '//' + window.location.hostname + redirect || redirect === '.') {
                    window.location.reload();
                } else {
                    if (redirect.startsWith('#')) {
                        // remove any existing hashes before adding the new one
                        const fullUrl = location.href;
                        const hashIndex = fullUrl.indexOf(location.hash);
                        const urlWithoutHash = hashIndex !== -1 ? fullUrl.substring(0, hashIndex) : fullUrl;
                        // console.log(urlWithoutHash);
                        window.location.href = urlWithoutHash + $(this).data('redirect');
                        // below is because it doesn't reload the page if the urlWithoutHash is the same
                        window.location.reload();
                    } else {
                        window.location.href = $(this).data('redirect');
                    }
                }
            }
        });

    });

    //To ensure that the browser attempts the scroll once the DOM is fully loaded, we can use the window load event.
    // This way, if the page has an anchor in the URL, it will attempt to scroll to it once the page finishes loading.
    // With thanks to ChatGPT
    window.addEventListener("load", () => {
        const hash = window.location.hash;
        if (hash) {
            const anchorElement = document.querySelector(hash);

            if (anchorElement) {
                // Initial scroll attempt
                anchorElement.scrollIntoView({ behavior: "smooth", block: "start" });

                // Fallback with a single delayed check to ensure scrolling works
                requestAnimationFrame(() => {
                    if (Math.abs(anchorElement.getBoundingClientRect().top) > 5) {
                        anchorElement.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                });
            }
        }
    });





    // Open the popup when an element is clicked
    $('.magnific-modal').on('click', function (event) {
        event.preventDefault(); // prevent the default action
        $(this).magnificPopup('open'); // open the popup
    });

    /*
    If we are loading the iframe, check the parent container to see if we are in AdminInModal context,
    then modify the form accordingly.
    (NB this is possible because the iframe and parent are in the same domain)
     */
    if(parent.document.getElementById('aim-mfp') != null) {
        customiseForm();
    }

    function onLoadIframe() {
        // console.log('iframe length', $iframe.length);
        // console.log('closeOnSaveReady 1', sessionStorage.getItem('closeOnSaveReady'));

        if ($iframe.length > 0) $iframe.on('load', function () {
            // console.log('noClose', noClose);
            // console.log('closeOnSaveReady 2', sessionStorage.getItem('closeOnSaveReady'));
            var $iframeBodyModal = $($iframe[0].contentWindow.document).find('body.modal');
            // console.log('iframe body modal', $iframeBodyModal);
            // console.log('Saving - check length', $iframeBodyModal.find(".NoticeError, .ui-state-error").length);
            let isAdd = $iframeBodyModal.find('#ProcessPageAdd').length > 0;
            // console.log('isAdd', isAdd);
            let content = parent.document.getElementById('aim-mfp');
            if (content != null) {
                let closeOnSave = content.getAttribute('close-on-save');
                // console.log(closeOnSave, 'closeOnSave');
                /*
                closeOnSave is a space-separated list of notice types that will allow the popup to close on save, or the word 'no' - in which case the popup will not close
                e.g."no": no close-on-save, "": allow, but any error, warning or message will prevent close-on-save, "messages": allow close if there are only messages, "errors warnings messages": always close regardless of notices'
                If "add" is included in the list, then the popup will close on save if it is a page add operation
                We set findErrors to the corresponding jQuery selector
                 */
                let findErrors = '';
                let includeAdd = false;
                if (closeOnSave != 'no') {
                    let closeArray = closeOnSave.split(" ");
                    closeArray.forEach(function (el, index, arr) {
                        let noticeType = el.trim();
                        if(noticeType === 'add') {
                            includeAdd = true;
                            return;
                        }
                        if (noticeType.slice(-1) === 's') {
                            noticeType = noticeType.slice(0, -1); // Remove the final 's'
                        }
                        findErrors += '.Notice' + noticeType.charAt(0).toUpperCase() + noticeType.slice(1) + ', ';
                    });
                    findErrors = ['.NoticeError', '.NoticeWarning', '.NoticeMessage'].filter(x => !findErrors.split(", ").includes(x)).join(', ');  // return the 'complement' of findErrors
                    if (findErrors.includes('.NoticeError')) {
                        findErrors += ', .ui-state-error, ';
                    }
                    findErrors = findErrors.substring(0, findErrors.length - 2);  // remove the final comma
                }
                // console.log('includeAdd', includeAdd);
                // console.log('findErrors', findErrors);
                if (!includeAdd && isAdd) {
                    noClose = true;
                }


                if (sessionStorage.getItem('closeOnSaveReady') == 'true') {
                    if (closeOnSave != 'no' && (!findErrors || $iframeBodyModal.find(findErrors).length == 0)) {
                        if (typeof Notifications != "undefined") {
                            var messages = [];
                            $('body.modal').find(".NoticeMessage").each(function () {
                                messages[messages.length] = $(this).text();
                            });
                            if (messages.length > 0) setTimeout(function () {
                                for (var i = 0; i < messages.length; i++) {
                                    Notifications.message(messages[i]);
                                }
                            }, 500);
                        }
                        // console.log('Close Popup');
                        /*
                        NB The action to close the popup appears to be cached if the conditions are not met and then actioned as soon as the conditions are met
                        By making it dependent on noClose, we can prevent the popup from closing until noClose is set to false even if the earlier conditions are met
                         */
                        if (!noClose) $.magnificPopup.close();
                        noClose = false;
                        // console.log('Popup closed');
                        // return;
                    } else {
                        // console.log('Popup left open');
                        // sessionStorage.setItem('closeOnSaveReady', 'false');
                        // errors occurred, so keep it open
                    }
                }
            }
        });
    }


    /*
    Dim while saving
     */

        $submit = $('form button.ui-button[type=submit]');
        // console.log('submit', $submit);
        $($submit).on('click', function (event) {
            sessionStorage.setItem('closeOnSaveReady', 'true');
            noClose = true;
            // console.log('closeOnSaveReady 3', sessionStorage.getItem('closeOnSaveReady'));
            $('body.modal').css("opacity", 0.2);

        });

    $('#aim-breakout').on('click', function (event) {
        var iframeSrc = parent.document.getElementsByClassName("mfp-iframe")[0].getAttribute('src');
        // console.log(iframeSrc, 'iframe src');
        let noModal = iframeSrc.replace('aim-mfp=1&modal=1&', '');
        parent.closeIframe(noModal);
    });
});

function closeIframe(url) {
    // console.log('closeIframe', url);
    $('iframe').remove();
    window.location.href = url;
}

/*
Add Save button at top of modal and suppress notices according to param set
 */
function customiseForm() {
    let content = parent.document.getElementById('aim-mfp');
    if (content != null) {
        let addSaveHead = content.getAttribute('save-head-button');
        if(addSaveHead == '1') {
            $('body.modal.ProcessPageEdit form, body.modal.ProcessPageAdd form').prepend('<div id="pw-content-head-buttons" ' +
                'class="uk-visible uk-grid"><span class="pw-button-dropdown-wrap uk-float-left">' +
                '<button id="submit_save_copy" class="ui-button ui-widget ui-corner-all pw-head-button pw-button-dropdown-main ui-state-default" ' +
                'name="submit_save" value="Save" type="submit" data-from_id="submit_save"><span class="ui-button-text">Save</span></button>' +
                '</span></div>');
        }
        let breakOut = content.getAttribute('breakout-button');
        if(breakOut == '1') {
            var src = parent.document.getElementById('aim-mfp').getAttribute('src');
            $('body.modal.ProcessPageEdit form, body.modal.ProcessPageAdd form').prepend('<div id="pw-content-head-buttons 2" ' +
                'class="uk-visible uk-grid uk-float-right">' +
                '<button id="aim-breakout" class="ui-button ui-priority-secondary ui-widget ui-corner-all pw-head-button ui-state-default" ' +
                'name="breakout" value="breakout"><span class="ui-button-text">Open in full page (save first if required)</a></button>' +
                '</div>');
        }
        let suppressNotices = content.getAttribute('suppress-notices');
        // console.log(suppressNotices, 'suppressNotices');
        let suppressArray = suppressNotices.split(" ");
        suppressArray.forEach(function (el, index, arr) {
            var noticeText = '.Notice' + el.charAt(0).toUpperCase()
                + el.slice(1);
            if(noticeText.length > 0) {
                noticeText = noticeText.substring(0, noticeText.length - 1);  // remove the 's'
                let selector = 'body.modal .pw-notices ' + noticeText;
                // console.log(selector, 'selector to hide');
                $(selector).hide();
            }
        });
    }
}