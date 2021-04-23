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
    const tinymceCSS = new TinymceCSS()

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
        console.log("Save button clicked!")
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

        //get answer content then post request to API
        const answerContent = getAnswerContent(tinymce.activeEditor.getBody());

        // const tmce = tinymce.activeEditor.getBody()
        const studentBody = `<div contenteditable="false">${toStudentContent(tinymce.activeEditor.getBody())}</div>`;

        // runtime.notify('save', {state: 'start'})
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
                student_content: studentBody,
                answer_content: answerContent
            }),
            success: saveStatus
        }).done(function (response) {
            // runtime.notify('save', {state: 'end'})
        })
    });

    $(element).find('.cancel-button').bind('click', function () {
        // console.log('Cancel button clicked')
        runtime.notify('cancel', {});
    });

    const replaceCSSToString = (css) => {
        return JSON.stringify(css).replaceAll("}", "").replaceAll("{", "").replaceAll("\"", "").replaceAll(",", ";")
    }

    const insertSelectionWithCss = (editor, css, cl, checkBr = false) => {
        const selection = tinymce.activeEditor.selection.getContent()
        const node = tinymce.activeEditor.selection.getNode()
        console.log(node.childNodes[node.childNodes.length - 1].nodeName !== "BR")
        const styles = replaceCSSToString(css)
        if (selection.includes("span")) return;
        if (checkBr && node.childNodes[node.childNodes.length - 1].nodeName !== "BR") {
            tinymce.activeEditor.selection.setContent("<span class='" + cl + "' style='" + styles + "' >" + selection + "</span><br>")
        } else {
            tinymce.activeEditor.selection.setContent("<span class='" + cl + "' style='" + styles + "' >" + selection + "</span>")
        }
    }

    //badge
    tinymce.PluginManager.add('badge', function (editor, url) {
        const toggleSpan = () => {
            if (tinymce.activeEditor.selection.getNode().tagName.toLowerCase() === "span") return
            tinymce.activeEditor.formatter.toggle('badge');
        }

        editor.ui.registry.addButton('badge', {
            text: 'Badge',
            onAction: function () {
                toggleSpan();
            }
        });
    });

    //sample
    tinymce.PluginManager.add('sample', function (editor, url) {
        const toggleSpan = () => {
            if (tinymce.activeEditor.selection.getNode().tagName.toLowerCase() === "span") return
            tinymce.activeEditor.formatter.toggle('sample');
        }

        editor.ui.registry.addButton('sample', {
            text: 'Sample',
            onAction: function () {
                toggleSpan();
            }
        });
    });

    //answerspan
    tinymce.PluginManager.add('answerspan', function (editor, url) {
        const toggleSpan = () => {
            if (tinymce.activeEditor.selection.getNode().tagName.toLowerCase() === "span") return
            insertSelectionWithCss(editor, tinymceCSS.answerspan, 'answerspan')
            // tinymce.activeEditor.formatter.toggle('answerspan');
        }

        editor.ui.registry.addButton('answerspan', {
            text: 'Answer Text',
            onAction: function () {
                toggleSpan();
            }
        });
    });

    //sourcespan
    tinymce.PluginManager.add('sourcespan', function (editor, url) {
        const toggleSpan = () => {

            if (tinymce.activeEditor.selection.getNode().className.toLowerCase() !== "hiddensource") return

            // tinymce.activeEditor.formatter.toggle('sourcespan');
            insertSelectionWithCss(editor, tinymceCSS.sourcespan, 'sourcespan', true)
        }

        editor.ui.registry.addButton('sourcespan', {
            text: 'Student Source',
            onAction: function () {
                toggleSpan();
            }
        });
    });

    //hidespan
    tinymce.PluginManager.add('hidespan', function (editor, url) {
        const toggleSpan = () => {
            if (tinymce.activeEditor.selection.getNode().className.toLowerCase() !== "hiddensource") return
            tinymce.activeEditor.formatter.toggle('hidespan');
        }

        editor.ui.registry.addButton('hidespan', {
            text: 'Hide',
            onAction: function () {
                toggleSpan();
            }
        });
    });

    //hiddensource
    tinymce.PluginManager.add('hiddensource', function (editor, url) {
        const toggleSpan = () => {
            if (tinymce.activeEditor.selection.getNode().tagName.toLowerCase() === "span") return
            tinymce.activeEditor.formatter.apply('hiddensource');
        }

        editor.ui.registry.addButton('hiddensource', {
            text: 'Source Code',
            onAction: function () {
                toggleSpan();
            }
        });
    });

    //student preview
    tinymce.PluginManager.add('studentpreview', function (editor, url) {
        const previewDialog = () => {
            return editor.windowManager.open({
                title: 'Student Preview',
                size: 'large',
                body: {
                    type: 'panel',
                    items: [{
                        type: 'iframe',
                        name: 'iframe',
                        sandboxed: false
                    }]
                },
                buttons: [{
                    type: 'cancel',
                    text: 'Close',
                    primary: true
                }],
            }).setData({
                iframe: toStudentContent(tinymce.activeEditor.getBody())
            })
        }

        editor.ui.registry.addButton('studentpreview', {
            text: 'Student Preview',
            onAction: function () {
                previewDialog();
            }
        });
    });


    const toStudentContent = (body) => {
        const studentBody = body.cloneNode(true)

        const answerspan = studentBody.getElementsByClassName('answerspan')
        const answerspanLength = answerspan.length
        const sourcespan = studentBody.getElementsByClassName('sourcespan')
        const sourcespanLength = sourcespan.length
        const hiddensource = studentBody.getElementsByClassName('hiddensource')

        for (let i = 0; i < answerspanLength; i++) {
            if (answerspan[0].innerHTML.includes("<br>")) {
                answerspan[0].outerHTML = `<textarea class='answerspanInput' placeholder='answer here' style='padding-left: 2px;background-color: #ADFFEE; border: 1px solid black; height:${(answerspan[0].innerHTML.match(/br/g) || []).length * 25}px;' />`
            } else {
                answerspan[0].outerHTML = `<input type='text' class="answerspanInput" placeholder="answer here" style='padding-left: 2px;background-color: #ADFFEE; border: 1px solid black;'/>`
            }
        }
        for (let i = 0; i < sourcespanLength; i++) {
            if (sourcespan[0].innerHTML.includes("<br>")) {
                sourcespan[0].outerHTML = `<textarea  class="sourcespanInput"  placeholder="source code here" style='padding-left: 2px; padding-right 2px; height: ${((sourcespan[0].innerHTML.match(/br/g) || []).length * 25) + 50}px; background-color: #ffedba; border: 1px solid black;'/>`
            } else {
                sourcespan[0].outerHTML = `<input type='text' class="sourcespanInput"  placeholder="answer here" style='padding-left: 2px; padding-right 2px; background-color: #ffedba; border: 1px solid black;'/>`
            }
        }

        for (let i = 0; i < hiddensource.length; i++) {
            for (let j = 0; j < hiddensource[i].children.length; j++) {
                const className = hiddensource[i].children[j].className
                if (className === "hidespan") {
                    hiddensource[i].children[j].style.display = 'none'
                    if (j + 1 < hiddensource[i].children.length)
                        hiddensource[i].children[j + 1].remove()
                }
            }
        }

        return studentBody.outerHTML
    }

    const getAnswerContent = (body) => {
        const studentBody = body.cloneNode(true)

        const answerspan = studentBody.getElementsByClassName('answerspan') === null ? [] : studentBody.getElementsByClassName('answerspan')
        const sourcespan = studentBody.getElementsByClassName('sourcespan') === null ? [] : studentBody.getElementsByClassName('sourcespan')

        const answerSpanContents = []
        const sourceSpanContents = []

        for (let i = 0; i < answerspan.length; i++) {
            let content = answerspan[0].innerHTML;
            if (content.includes("<br>")) content = content.replaceAll("<br>", "\n");
            answerSpanContents.push(
                content
            );
        }

        for (let i = 0; i < sourcespan.length; i++) {
            let content = sourcespan[0].innerHTML;
            if (content.includes("<br>")) content = content.replaceAll("<br>", "\n");
            sourceSpanContents.push(
                content
            );
        }

        const answerContents = {
            answerSpan: answerSpanContents,
            sourceSpan: sourceSpanContents
        }
        console.log("🚀 ~ file: studio.js ~ line 264 ~ getAnswerContent ~ answerContents", answerContents)
        return answerContents;
    }

    $('#tinymce').tinymce({
        force_br_newlines: true,
        force_p_newlines: false,
        selector: "#tinymce",
        height: "500px",
        plugins: [
            "code, contextmenu, image, searchreplace, textcolor, table, answerspan, sourcespan, sample, badge, studentpreview, hiddensource, hidespan"
        ],
        toolbar: "forecolor | bold italic underline | example | code | removeformat | searchreplace | table | alignleft aligncenter alignright alignfull | badge sample | answerspan | hiddensource sourcespan hidespan | studentpreview",
        contextmenu: "bold italic",
        formats: {
            badge: {
                inline: 'span',
                styles: tinymceCSS.badge,
                classes: 'badge'
            },
            sample: {
                inline: 'span',
                styles: tinymceCSS.sample,
                classes: 'sample'
            },
            answerspan: {
                inline: 'span',
                styles: tinymceCSS.answerspan,
                classes: 'answerspan'
            },
            sourcespan: {
                inline: 'span',
                styles: tinymceCSS.sourcespan,
                classes: 'sourcespan'
            },
            hiddensource: {
                block: 'div',
                styles: tinymceCSS.hiddensource,
                classes: 'hiddensource'
            },
            hidespan: {
                inline: 'span',
                styles: tinymceCSS.hidespan,
                classes: 'hidespan'
            }
        },
        setup: (ed) => {
            ed.on("paste", function (e) {
                if (tinymce.activeEditor.selection.getNode().tagName.toLowerCase() === "span") {
                    const text = (e.originalEvent || e).clipboardData.getData('text/plain');
                    tinymce.activeEditor.selection.setContent(text.replace(/\n/g, "<br>"))
                    e.preventDefault()
                }
            })

            ed.on('keydown', function (e) {
                //enter case for span
                if (e.key === "Enter" && !e.ctrlKey && tinymce.activeEditor.selection.getNode().tagName.toLowerCase() === "span") {
                    tinymce.activeEditor.selection.setContent("<br/>")
                    e.preventDefault()
                }
            });

            //disable drag
            ed.on('dragover dragenter dragend drag drop', function (e) {
                e.stopPropagation();
                e.preventDefault()
            });

            ed.on('draggesture', function (e) {
                e.stopPropagation();
                e.preventDefault()
            });

        }
    });

}

function removeInput(param) {
    param.parentNode.remove()
}

class TinymceCSS {
    badge = {
        display: 'inline-block',
        'border-radius': '5px',
        padding: '2px 5px',
        margin: '0 2px',
        border: '1px dashed #ff0000',
        color: '#ff0000'
    }
    sample = {
        'background-color': '#eeeeee',
        display: 'inline-block',
        padding: '8px',
        margin: '4px 4px',
        border: '2px dashed #A9A9A9',
        minWidth: '80%',
        maxWidth: '100%',
    }
    answerspan = {
        'background-color': '#ADFFEE',
        color: 'gray',
        display: 'inline-block',
        'border-radius': '3px',
        border: '1px solid black',
        paddingRight: '2px',
        paddingLeft: '2px',
    }
    sourcespan = {
        'background-color': '#ffedba',
        color: 'gray',
        display: 'inline-block',
        'border-radius': '3px'
    }
    hiddensource = {
        padding: '16px',
        margin: '0 auto',
        position: 'relative',
        left: '0',
        right: '0',
        width: 'auto',
        'font-family': '"Consolas", "Lucida Console", Monaco, monospace',
        'background-color': '#ffffff',
        border: '1px solid black',
        'border-radius': '3px'
    }
    hidespan = {
        color: 'rgba(107,107,107,0.7)',
        display: 'inline-block',
        'background-color': '#dedede',
    }
}