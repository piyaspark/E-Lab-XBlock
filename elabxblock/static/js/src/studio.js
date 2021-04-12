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
            runtime.notify('save', {state: 'end'})
        })
    });

    $(element).find('.cancel-button').bind('click', function () {
        // console.log('Cancel button clicked')
        runtime.notify('cancel', {});
    });

    const replaceCSSToString = (css) => {
        return JSON.stringify(css).replaceAll("}","").replaceAll("{","").replaceAll("\"","").replaceAll(",",";")
    }

    //answerspan
    tinymce.PluginManager.add('answerspan', function (editor, url) {
        const toggleSpan = () => {
            if (tinymce.activeEditor.selection.getNode().tagName.toLowerCase() === "span") return
            tinymce.activeEditor.formatter.toggle('answerspan');
        }

        editor.ui.registry.addButton('answerspan', {
            text: 'Answer Span',
            onAction: function () {
                toggleSpan();
            }
        });
    });

    //answersource
    tinymce.PluginManager.add('answersource', function (editor, url) {
        const toggleSpan = () => {
            if (tinymce.activeEditor.selection.getNode().tagName.toLowerCase() === "span") return
            tinymce.activeEditor.formatter.toggle('answersource');
        }

        editor.ui.registry.addButton('answersource', {
            text: 'Answer Source',
            onAction: function () {
                toggleSpan();
            }
        });
    });

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

    //sourcespan
    tinymce.PluginManager.add('sourcespan', function (editor, url) {
        const toggleSpan = () => {
            // console.log(tinymce.activeEditor.selection.getContent())
            // const selection = tinymce.activeEditor.selection.getContent()
            // const styles = replaceCSSToString(tinymceCSS.sourcespan)
            // editor.insertContent("<span class='sourcespan' style='"+ styles +"' >" + selection + "</span>")

            if (tinymce.activeEditor.selection.getNode().className.toLowerCase() !== "hiddensource") return
            tinymce.activeEditor.formatter.toggle('sourcespan');
        }

        editor.ui.registry.addButton('sourcespan', {
            text: 'Source Span',
            onAction: function () {
                toggleSpan();
            }
        });
    });

    //hiddensource
    tinymce.PluginManager.add('hiddensource', function (editor, url) {
        const toggleSpan = () => {
            if (tinymce.activeEditor.selection.getNode().tagName.toLowerCase() === "span") return
            tinymce.activeEditor.formatter.toggle('hiddensource');
        }

        editor.ui.registry.addButton('hiddensource', {
            text: 'Hidden Source',
            onAction: function () {
                toggleSpan();
            }
        });
    });

    //exclude
    tinymce.PluginManager.add('exclude', function (editor, url) {
        const toggleSpan = () => {
            if (tinymce.activeEditor.selection.getNode().tagName.toLowerCase() === "span") return
            tinymce.activeEditor.formatter.toggle('exclude');
        }

        editor.ui.registry.addButton('exclude', {
            text: 'Exclude',
            onAction: function () {
                toggleSpan();
            }
        });
    });

    //hidden
    tinymce.PluginManager.add('hidden', function (editor, url) {
        const toggleSpan = () => {
            if (tinymce.activeEditor.selection.getNode().tagName.toLowerCase() === "span") return
            tinymce.activeEditor.formatter.apply('hidden');
            //   tinymce.DOM.addClass('hidden', 'hidden');
            //   tinymce.activeEditor.dom.addClass(tinymce.activeEditor.dom.select('span'), 'hidden');
            alert(tinymce.activeEditor.selection.getNode().span);


        }

        editor.ui.registry.addButton('hidden', {
            text: 'Hidden',
            onAction: function () {
                toggleSpan();
            }
        });
    });

    //student preview
    tinymce.PluginManager.add('studentpreview', function (editor, url) {
        const previewDialog = () => {
            const body = `<div style="height: 0;">${toStudentContent(tinymce.activeEditor.getBody())}</div>`

            return editor.windowManager.open({
                title: 'Student Preview',
                size: 'large',
                body: {
                    type: 'panel',
                    items: [{
                        type: 'htmlpanel',
                        html: body
                    }]
                },
                buttons: [{
                    type: 'cancel',
                    text: 'Close',
                    primary: true
                }],
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
        const answersource = studentBody.getElementsByClassName('answersource')
        const answersourceLength = answersource.length
        const sourcespan = studentBody.getElementsByClassName('sourcespan')
        const sourcespanLength = sourcespan.length

        for (let i = 0; i < answerspanLength; i++) {
            if (answerspan[0].innerHTML.includes("<br>")) {
                answerspan[0].outerHTML = `<textarea class='answerspanInput' placeholder='answer here' style='padding-left: 2px;background-color: #ADFFEE; border: 1px solid black; height:${(answerspan[0].innerHTML.match(/br/g) || []).length * 25}px;' />`
            } else {
                answerspan[0].outerHTML = `<input type='text' class="answerspanInput" placeholder="answer here" style='padding-left: 2px;background-color: #ADFFEE; border: 1px solid black;'/>`
            }
        }
        for (let i = 0; i < answersourceLength; i++) {
            if (answersource[0].innerHTML.includes("<br>")) {
                answersource[0].outerHTML = `<textarea class="answersourceInput"  placeholder="answer here" style='padding-left: 2px; padding-right 2px; background-color: #ffedba; border: 1px solid black; height:${(answersource[0].innerHTML.match(/br/g) || []).length * 25}px;'/>`
            } else {
                answersource[0].outerHTML = `<input type='text' class="answersourceInput"  placeholder="answer here" style='padding-left: 2px; padding-right 2px; background-color: #ffedba; border: 1px solid black;'/>`
            }
        }
        for (let i = 0; i < sourcespanLength; i++) {
            sourcespan[0].outerHTML = `<textarea  class="sourcespanInput"  placeholder="source code here" style='padding-left: 2px; padding-right 2px; height: ${((sourcespan[0].innerHTML.match(/br/g) || []).length * 25) + 50}px; width: 100%; background-color: #ffedba; border: 1px solid black;'/>`
        }
        $(studentBody).find('.hiddensource').replaceWith(function() {
            return $('textarea', this);
        });

        return studentBody.outerHTML
    }

    const getAnswerContent = (body) => {
        const studentBody = body.cloneNode(true)

        const answerspan = studentBody.getElementsByClassName('answerspan') === null ? [] : studentBody.getElementsByClassName('answerspan')
        const answersource = studentBody.getElementsByClassName('answersource') === null ? [] : studentBody.getElementsByClassName('answersource')
        const sourcespan = studentBody.getElementsByClassName('sourcespan') === null ? [] : studentBody.getElementsByClassName('sourcespan')

        const answerSpanContents = []
        const answerSourceContents = []
        const sourceSpanContents = []

        for (let i = 0; i < answerspan.length; i++) {
            let content = answerspan[0].innerHTML;
            if (content.includes("<br>")) content = content.replaceAll("<br>", "\n");
            answerSpanContents.push(
                content
            );
        }

        for (let i = 0; i < answersource.length; i++) {
            let content = answersource[0].innerHTML;
            if (content.includes("<br>")) content = content.replaceAll("<br>", "\n");
            answerSourceContents.push(
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
            answerSource: answerSourceContents,
            sourceSpan: sourceSpanContents
        }
        console.log("🚀 ~ file: studio.js ~ line 264 ~ getAnswerContent ~ answerContents", answerContents)
        return answerContents;
    }

    tinymce.init({
        force_br_newlines: true,
        force_p_newlines: false,
        selector: "#tinymce",
        height: "500px",
        plugins: [
            "code, contextmenu, image, searchreplace, textcolor, table, answerspan, sourcespan, sample, badge, exclude, hidden, answersource, studentpreview, hiddensource"
        ],
        toolbar: "forecolor | bold italic underline | example | code | removeformat | searchreplace | table | alignleft aligncenter alignright alignfull | badge sample | answerspan answersource | hiddensource sourcespan | studentpreview",
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
            answersource: {
                inline: 'span',
                styles: tinymceCSS.answersource,
                classes: 'answersource'
            },
            sourcespan: {
                inline: 'span',
                styles: tinymceCSS.sourcespan,
                classes: 'sourcespan'
            },
            hiddensource:{
                inline: 'span',
                styles: tinymceCSS.hiddensource,
                classes: 'hiddensource'
            },
            exclude: {
                inline: 'span',
                styles: tinymceCSS.exclude,
                classes: 'exclude'
            },
            hidden: {
                inline: 'span',
                styles: tinymceCSS.hidden,
                classes: 'hidden'
            }
        },
        setup: (ed) => {
            ed.on("paste", function (e) {
                if (tinymce.activeEditor.selection.getNode().tagName.toLowerCase() === "span") {
                    e.preventDefault();
                    const text = (e.originalEvent || e).clipboardData.getData('text/plain');
                    tinymce.activeEditor.selection.setContent(text.replace(/\n/g, "<br>"))
                }
            })

            ed.on('keydown', function (e) {
                //enter case for span
                if (e.key === "Enter" && !e.ctrlKey && tinymce.activeEditor.selection.getNode().tagName.toLowerCase() === "span") {
                    tinymce.activeEditor.selection.setContent("<br/>")
                    e.preventDefault()
                }

                //tab case
                if (e.key === "Tab" && !e.shiftKey) {
                    tinymce.activeEditor.selection.setContent("\t")
                    e.preventDefault()
                }
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
    answersource = {
        'background-color': '#ffedba',
        color: 'gray',
        border: '1px solid black',
        display: 'inline-block',
        'border-radius': '3px',
        paddingRight: '2px',
        paddingLeft: '2px',
    }
    sourcespan = {
        width: '100%',
        'background-color': '#ffedba',
        color: 'gray',
        display: 'inline-block',
        'border-radius': '3px'
    }
    hiddensource = {
        width: '100%',
        'background-color': '#deccff',
        color: 'gray',
        border: '1px solid black',
        display: 'inline-block',
        'border-radius': '3px'
    }
    exclude = {
        color: 'rgb(16, 133, 70, 0.7)',
        display: 'inline-block',
        'border-radius': '3px',
        fontWeight: 'bold'
    }
    hidden = {
        color: 'rgb(110, 20, 156, 0.7)',
        display: 'inline-block',
        'border-radius': '3px',
        fontWeight: 'bold'
    }
}