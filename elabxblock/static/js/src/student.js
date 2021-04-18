function ELabXBlock(runtime, element) {

    $(function ($) {
        /* Here's where you'd do things on page load. */
    });

    const handleSubmitUrl = runtime.handlerUrl(element, 'submit_answer');


    $(element).find('#submit_button').click(function (eventObject) {
        const studentInputs = getStudentInputs()
        console.log("🚀 ~ file: student.js ~ line 12 ~ studentInputs", studentInputs)

        $.ajax({
            type: "POST",
            url: handleSubmitUrl,
            data: JSON.stringify({
                student_inputs: studentInputs
            })
        });
    });

    $("#current").click(function (eventObject) {
        const current = $('#current')
        if (!current.hasClass("active")) {
            current.addClass("active");
            $('#recent').removeClass("active");
            $('#currentDiv').removeClass("hidden")
            $('#recentDiv').addClass("hidden")
        }
    })

    $("#recent").click(function (eventObject) {
        const recent = $('#recent')
        if (!recent.hasClass("active")) {
            recent.addClass("active");
            $('#current').removeClass("active");
            $('#currentDiv').addClass("hidden")
            $('#recentDiv').removeClass("hidden")
        }
    })

    $("#copyCurrent").click(function (eventObject) {
        setStudentsInputs(getRecentInputs())
        $("#current").click()
    })

    const getStudentInputs = () => {
        const answerSpan = []
        const sourceSpan = []
        const answerSpanIp = document.getElementById('currentDiv').getElementsByClassName('answerspanInput')
        const sourceSpanIp = document.getElementById('currentDiv').getElementsByClassName('sourcespanInput')

        for (let i = 0; i < answerSpanIp.length; i++) {
            let content = answerSpanIp[i].value;
            answerSpan.push(
                content
            );
        }

        for (let i = 0; i < sourceSpanIp.length; i++) {
            let content = sourceSpanIp[i].value;
            sourceSpan.push(
                content
            );
        }

        return {
            answerSpan,
            sourceSpan
        };
    }

    const getRecentInputs = () => {
        const answerSpan = []
        const sourceSpan = []
        const answerSpanIp = document.getElementById('recentDiv').getElementsByClassName('answerspanInput')
        const sourceSpanIp = document.getElementById('recentDiv').getElementsByClassName('sourcespanInput')

        for (let i = 0; i < answerSpanIp.length; i++) {
            let content = answerSpanIp[i].value;
            answerSpan.push(
                content
            );
        }

        for (let i = 0; i < sourceSpanIp.length; i++) {
            let content = sourceSpanIp[i].value;
            sourceSpan.push(
                content
            );
        }

        return {
            answerSpan,
            sourceSpan
        };
    }

}


const setStudentsInputs = (studentInput) => {
    const {answerSpan, sourceSpan} = studentInput

    const answerSpanIp = document.getElementById('currentDiv').getElementsByClassName('answerspanInput')
    const sourceSpanIp = document.getElementById('currentDiv').getElementsByClassName('sourcespanInput')

    for (let i = 0; i < answerSpanIp.length; i++) {
        answerSpanIp[i].value = answerSpan[i];
    }

    for (let i = 0; i < sourceSpanIp.length; i++) {
        sourceSpanIp[i].value = sourceSpan[i];
    }
}

const setRecentInputs = (studentInput) => {
    const {answerSpan, sourceSpan} = studentInput

    const answerSpanIp = document.getElementById('recentDiv').getElementsByClassName('answerspanInput')
    const sourceSpanIp = document.getElementById('recentDiv').getElementsByClassName('sourcespanInput')

    for (let i = 0; i < answerSpanIp.length; i++) {
        answerSpanIp[i].value = answerSpan[i];
    }

    for (let i = 0; i < sourceSpanIp.length; i++) {
        sourceSpanIp[i].value = sourceSpan[i];
    }
}