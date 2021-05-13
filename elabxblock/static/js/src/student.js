function Student(runtime, element) {

    $(function ($) {
        /* Here's where you'd do things on page load. */
    });

    const submitHandle = (result) => {
        console.log(result)
        if (result.success === 1) {
            fetchSubmitStatus(result.submit_id)
        } else {
            alert("Submit failure: " + result.message)
        }
    }

    const fetchSubmitStatus = (submitId) => {
        const fetchSubmitStatusInterval = setInterval(() => {
            $.ajax({
                type: "GET",
                url: "https://kulomb.pknn.dev/api/tasks/submit/status/" + submitId,
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE"
                },
                success: (response) => {
                    console.log(response)
                    const res = JSON.parse(response)
                    if (res.result.length !== 0) {
                        $('#result_show_list').text("")
                        const resultLists = res.result
                        let passCount = 0
                        for (let i = 0; i < resultLists.length; i++) {
                            if (resultLists[i].toLowerCase() === "p") passCount += 1
                            $('#result_show_list').append(resultLists[i])
                        }
                        $('#result_show_score').text(passCount)
                        sendScore(resultLists)
                        clearInterval(fetchSubmitStatusInterval);
                    }
                },
                error: () => {
                    clearInterval(fetchSubmitStatusInterval);
                }
            });

        }, 2000)
    }

    const sendScore = (resultLists) => {
        $.ajax({
            type: "POST",
            url: handleGetScore,
            data: JSON.stringify({
            gradingResult: resultLists
        }),
        })
    }

    const handleGetScore = runtime.handlerUrl(element, 'get_score');
    const handleSubmitUrl = runtime.handlerUrl(element, 'submit_answer');


    $(element).find('#submit_button').click(function (eventObject) {
        const studentInputs = getStudentInputs()
        console.log("🚀 ~ file: student.js ~ line 12 ~ studentInputs", studentInputs)

        $.ajax({
            type: "POST",
            url: handleSubmitUrl,
            data: JSON.stringify({
                student_inputs: studentInputs
            }),
            success: submitHandle,
            error: function(xhr, status, error) {
                alert(xhr.responseText);
              }
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