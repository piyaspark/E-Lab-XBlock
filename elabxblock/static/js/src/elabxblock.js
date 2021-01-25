/* Javascript for ELabXBlock. */
function ELabXBlock(runtime, element) {

    function updateCount(result) {
        $('.count', element).text(result.count);
    }

    const updataeInputList = (result) => {
        const input_list = result.input_list
        $('#input_box', element).append("<div class=\"flex-row my-1 mx-2\">" +
            `<p class=\"mx-1 my-0\">Input #${input_list[input_list.length - 1].i + 1}</p>` +
            `<input class=\"h-auto input-middle\" placeholder=\"input ${input_list[input_list.length - 1].i + 1}\"` +
            `value=\"${input_list[input_list.length - 1].value}\"/>` +
            "</div>");
        console.log(result.input_list[0].i + 1)
    }

    var handlerUrl = runtime.handlerUrl(element, 'increment_count');
    var handleAddInputUrl = runtime.handlerUrl(element, 'increase_input');

    $('#increase', element).click(function (eventObject) {
        $.ajax({
            type: "POST",
            url: handlerUrl,
            data: JSON.stringify({"hello": "world"}),
            success: updateCount
        });
    });
    $('#add_input', element).click(function (eventObject) {
        $.ajax({
            type: "POST",
            url: handleAddInputUrl,
            data: JSON.stringify({}),
            success: updataeInputList
        });
    });

    $(function ($) {
        /* Here's where you'd do things on page load. */
    });
}
