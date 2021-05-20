function Student(runtime, element, data) {

    const elabxblockId = data.elabxblock_id
    const resultList2 = data.grading_results
    const inputList = data.input_list
    const handleGetScore = runtime.handlerUrl(element, 'get_score');
    const handleSubmitUrl = runtime.handlerUrl(element, 'submit_answer');

    $(window).on("load", function () {
        //set history
        const studentInputs = {{student_inputs | safe}}
        console.log(studentInputs)
        if (jQuery.isEmptyObject(studentInputs)) {
            $('#recent').prop("disabled", true)
        } else {
            $('#recent').prop("disabled", false)
            setRecentInputs(studentInputs)
        }

        // result list
        console.log(elabxblockId.toString())
        $('#result_show_list_' + elabxblockId).text("")
        if (resultList2.length === 0) {
            for (let i = 0; i < inputList.length; i++) {
                $('#result_show_list_' + elabxblockId).append("-")
            }
        } else {
            // let passCount = 0
            for (let i = 0; i < resultList2.length; i++) {
                // if (resultList[i].toLowerCase() === "p") passCount += 1
                $('#result_show_list_' + elabxblockId).append(resultList2[i])
            }
            // $('#result_show_score').text(passCount)
        }
        console.log(resultList2)
    })

    const submitHandle = (result) => {
        console.log(result)
        if (result.success === 1) {
            fetchSubmitStatus(result.submit_id)

        } else {
            alert("Submit failure: " + result.message)
        }
    }

    const fetchSubmitStatus = (submitId) => {
        let count = 20;
        $('#result_show_list_' + elabxblockId).text("")

        const fetchSubmitStatusInterval = setInterval(() => {
            if (count === 0) {
                onSubmitFail();
            }
            $.ajax({
                type: "GET",
                url: "https://kulomb.pknn.dev/api/tasks/submit/status/" + submitId,
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE"
                },
                success: (response) => {
                    console.log("start here")
                    console.log(response)
                    console.log(response.result.length)
                    if (response.result.length !== 0) {
                        console.log("meet condition")
                        $('#result_show_list_' + elabxblockId).text("")
                        const resultLists = response.result
                        // let passCount = 0
                        for (let i = 0; i < resultLists.length; i++) {
                            // if (resultLists[i].toLowerCase() === "p") passCount += 1
                            $('#result_show_list_' + elabxblockId).append(resultLists[i])
                        }
                        // $('#result_show_score').text(passCount)
                        sendScore(resultLists)
                        clearInterval(fetchSubmitStatusInterval);
                    }
                },
                error: () => {
                    for (let i = 0; i < inputList.length; i++) {
                        $('#result_show_list_' + elabxblockId).append("-")
                    }
                    onSubmitFail();
                }
            });
            count--;
        }, 3000)

        const onSubmitFail = () => {

            clearInterval(fetchSubmitStatusInterval);
        }
    }

    const sendScore = (resultLists) => {
        $.ajax({
            type: "POST",
            url: handleGetScore,
            data: JSON.stringify({
                gradingResult: resultLists
            }),
            success: () => {
                console.log("sendScore: success");
            }
        })
    }

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
            error: function (xhr, status, error) {
                console.log(status)
                console.log(error)
                console.log("error ==> Data: " + JSON.stringify({
                    student_inputs: studentInputs
                }))
                alert("Error to submit answer")
              }
        });

        console.log("Data: " + JSON.stringify({
            student_inputs: studentInputs
        }))
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
        const answerSpanIp = document.getElementById('currentDiv_' + elabxblockId).getElementsByClassName('answerspanInput')
        const sourceSpanIp = document.getElementById('currentDiv_' + elabxblockId).getElementsByClassName('sourcespanInput')

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