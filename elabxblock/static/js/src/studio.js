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
            `<textarea class=\"h-auto text-center input_selector\"` +
            ` placeholder=\"input ${lastIndex}\" value=\"\" />` +
            `<p class=\"ml-2 text-red-500 my-1 cursor-pointer\" onclick=\"removeInput(this)\">X</p>` +
            "</div>");
    });


    $(element).find('.save-button').click(function (eventObject) {
        console.log("Save button clicked!")
        const title = $('#title', element).val()
        const description = $('#description', element).val()
        const programingLanguage = $('#programing_language', element).val()

        const listInput = document.getElementsByClassName("input_selector")
        const inputs = []
        for (let i = 0; i < listInput.length; i++) {
            if (listInput[i].value !== "")
                inputs.push(listInput[i].value)
                console.log(listInput[i].value);
        }

        const frameObj = document.getElementsByTagName("IFRAME")[0];
        const body = frameObj.contentWindow.document.body;
        const editorContent = body.innerHTML;
        const sourceCode = body.getElementsByClassName("sourcecode")
        let mergeSource = ""
        for (let i = 0; i < sourceCode.length; i++) {
            mergeSource = mergeSource.concat(sourceCode[i].outerHTML)
        }
        
        //get answer content then post request to API
        const answerContent = getAnswerContent(body);
        console.log(answerContent)

        const studentBody = `<div contenteditable="false">${toStudentContent(body)}</div>`;
        
        console.log("<div>" + mergeSource.replaceAll("<br>", "<br />") + "</div>")

        //For develoment, comment out runtime.notify method
        runtime.notify('save', {state: 'start'})
        $.ajax({
            type: "POST",
            url: handleSaveUrl,
            data: JSON.stringify({
                title: title,
                description: description,
                programing_language: programingLanguage,
                listInput: listInput.length === 0 ? [""] : inputs,
                editor_content: editorContent,
                student_content: studentBody,
                answer_content: answerContent,
                sources: "<div>" + mergeSource.replaceAll("<br>", "<br />") + "</div>"
            }),
            success: saveStatus
        }).done(function (response) {
            //For develoment, comment out runtime.notify method
            runtime.notify('save', {state: 'end'})
        })
    });

    $(element).find('.cancel-button').bind('click', function () {
        console.log('Cancel button clicked')
        runtime.notify('cancel', {});
    });

}

function removeInput(param) {
    param.parentNode.remove()
}

const toStudentContent = (body) => {
    const studentBody = body.cloneNode(true)

    const answerspan = studentBody.getElementsByClassName('answerspan')
    const answerspanLength = answerspan.length
    const sourcespan = studentBody.getElementsByClassName('sourcespan')
    const sourcespanLength = sourcespan.length
    const sourcecode = studentBody.getElementsByClassName('sourcecode')

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

    for (let i = 0; i < sourcecode.length; i++) {
        for (let j = 0; j < sourcecode[i].children.length; j++) {
            const className = sourcecode[i].children[j].className
            if (className === "hidespan") {
                sourcecode[i].children[j].style.display = 'none'
                if (j + 1 < sourcecode[i].children.length)
                    sourcecode[i].children[j + 1].remove()
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

    return answerContents;
}
