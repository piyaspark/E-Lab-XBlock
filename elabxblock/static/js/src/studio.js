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
                listInput: listInput.length === 0 ? [""] : inputs
            }),
            success: saveStatus
        }).done(function(response) {
            runtime.notify('save', {state: 'end'})
        }) 
    });

    $(element).find('.cancel-button').bind('click', function() {
        // console.log('Cancel button clicked')
        runtime.notify('cancel', {});
      });

    $(function ($) {
        /* Here's where you'd do things on page load. */
    });
}

function removeInput(param) {
    param.parentNode.remove()
}