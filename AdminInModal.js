$(document).ready(function ($) {
    /*
    Not sure why we need to add ' $' as an argument to the function, but it seems to be necessary
    See https://stackoverflow.com/questions/40218341/typeerror-magnificpopup-is-not-a-function
     */

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
            callbacks: {
                open: function () {
                    // Will fire when this exact popup is opened
                    // this - is Magnific Popup object
                },
            },
            // elementParse: function (item) {
            //     console.log(item, 'parseItem');
            // },
            // change: function() {
            //     console.log('Content changed');
            //     console.log(this.content); // Direct reference to your popup element
            // },
            // }
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
            let suppressNotices = $(this).data('suppress-notices');
            let headerText = $(this).data('header-text');
            let closeButton = $(this).data('close-button');
            $.magnificPopup.instance.contentContainer.attr({'style': 'max-width: ' + width + ' !important; max-height: ' + height + ' !important;'});
            $.magnificPopup.instance.content.attr({'save-head-button': addSaveHead});
            $.magnificPopup.instance.content.attr({'suppress-notices': suppressNotices});
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
            if ($(this).data('redirect')) {
                if (window.location.href == window.location.protocol + '//' + window.location.hostname + $(this).data('redirect') || $(this).data('redirect') == '.') {
                    window.location.reload();
                } else {
                    window.location.href = $(this).data('redirect');
                }
            }
        });

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


    /*
    Dim while saving
     */
    $("[name=submit_save]").on('click', function () {
        $('body.modal').css("opacity", 0.2);
    });


});


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
        let suppressNotices = content.getAttribute('suppress-notices');
        console.log(suppressNotices, 'suppressNotices');
        let suppressArray = suppressNotices.split(" ");
        suppressArray.forEach(function (el, index, arr) {
            var noticeText = '.Notice' + el.charAt(0).toUpperCase()
                + el.slice(1);
            if(noticeText.length > 0) {
                noticeText = noticeText.substring(0, noticeText.length - 1);  // remove the 's'
                let selector = 'body.modal .pw-notices ' + noticeText;
                console.log(selector, 'selector to hide');
                $(selector).hide();
            }
        });
    }
}