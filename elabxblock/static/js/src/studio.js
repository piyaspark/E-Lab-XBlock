/* Javascript for ELabXBlock. */
function Studio(runtime, element) {

    const saveStatus = (result) => {
        if (result.success === 1) {
            alert("Save Success")
        } else {
            alert("Save failure missing " + result.data)
            $(`#${result.data}`, element).focus()
        }
    }

    const handleSaveUrl = runtime.handlerUrl(element, 'save_data');

    $('#add_input', element).click(function () {
        const lastIndex = document.getElementsByClassName("input_selector").length + 1
        $('#input_box', element).append("<div class=\"flex flex-row my-1 mx-2 align-left items-center \">" +
            `<p class=\"mx-1 my-1\">Input #${lastIndex}</p>` +
            `<input class=\"h-auto text-center input_selector\"` +
            ` placeholder=\"input ${lastIndex}\" value=\"\" />` +
            `<p class=\"ml-2 text-red-500 my-1 cursor-pointer\" onclick=\"removeInput(this)\">X</p>` +
            "</div>");
    });

    $(element).find('.save-button').click(function (eventObject) {
        // console.log("Save button clicked!")
        const title = $('#title', element).val()
        const description = $('#description', element).val()
        const runtimeLimit = $('#runtime_limit', element).val() !== "" ? $('#runtime_limit', element).val() : "1000"
        const memoryLimit = $('#memory_limit', element).val() !== "" ? $('#memory_limit', element).val() : "500"
        const programingLanguage = $('#programing_language', element).val()

        const listInput = document.getElementsByClassName("input_selector")
        const inputs = []
        for (let i = 0; i < listInput.length; i++) {
            if (listInput[i].value !== "")
                inputs.push(listInput[i].value)
        }

        const tmce = tinymce.activeEditor.getBody()
        const answerIps = tmce.getElementsByTagName("input")
        const sourcodeIps = tmce.getElementsByTagName("textarea")
        const answers = []
        const sourcecodes = []

        for (let i = 0; i < answerIps.length; i++) {
            answers.push(answerIps[i].value)
        }
        for (let i = 0; i < sourcodeIps.length; i++) {
            sourcecodes.push(sourcodeIps[i].value)
        }

        runtime.notify('save', {state: 'start'})
        $.ajax({
            type: "POST",
            url: handleSaveUrl,
            data: JSON.stringify({
                title: title,
                description: description,
                runtime_limit: runtimeLimit,
                memory_limit: memoryLimit,
                programing_language: programingLanguage,
                listInput: listInput.length === 0 ? [""] : inputs,
                editor_content: tinymce.activeEditor.getContent(),
                answers: answers,
                sourcodes: sourcecodes,
            }),
            success: saveStatus
        }).done(function (response) {
            runtime.notify('save', {state: 'end'})
        })
    });

    $(element).find('.cancel-button').bind('click', function () {
        // console.log('Cancel button clicked')
        runtime.notify('cancel', {});
    });

    $(function ($) {
        /* Here's where you'd do things on page load. */
    });

    //init Tiny mce
    tinymce.PluginManager.add('answerinput', function (editor, url) {
        var input = `<input class="answer" placeholder="answer here" style="margin-left: 1em; margin-right: 1em"/>`
        var addInput = () => editor.insertContent(input);

        editor.ui.registry.addButton('answerinput', {
            text: 'Input',
            onAction: function () {
                addInput();
            }
        });
        editor.ui.registry.addMenuItem('answerinput', {
            text: 'Add input with answer',
            onAction: function () {
                addInput();
            }
        });
    });
    //init Tiny mce
    tinymce.PluginManager.add('sourcecode', function (editor, url) {
        const textarea = `<textarea class="sourcecode" placeholder="Source code here ..." style="width: 100%;height: 20em; margin-top: 1em; margin-bottom: 1em;"></textarea>`
        var addTextarea = () => editor.insertContent(textarea);

        editor.ui.registry.addButton('sourcecode', {
            text: 'Source Code',
            onAction: function () {
                addTextarea();
            }
        });
        editor.ui.registry.addMenuItem('sourcecode', {
            text: 'Add Source Code',
            onAction: function () {
                addTextarea();
            }
        });
    });
    tinymce.init({
        selector: "#tinymce",
        height: "500px",
        plugins: [
            "code, preview, contextmenu, image, searchreplace, answerinput sourcecode"
        ],
        toolbar: "bold italic | example | code | preview | searchreplace | answerinput sourcecode ",
        contextmenu: "bold italic answerinput sourcecode",
        setup: (ed) => {
            ed.on('keydown', function (e) {
                if (e.keyCode == 13 && e.target.tagName.toLowerCase() === 'textarea') {
                    e.target.value = e.target.value + "\n"
                    e.preventDefault()
                }
                if (e.keyCode == 9 && e.target.tagName.toLowerCase() === 'textarea') {
                    e.target.value = e.target.value + "\t"
                    e.preventDefault()
                }
            });
        }
    });

}

function removeInput(param) {
    param.parentNode.remove()
}