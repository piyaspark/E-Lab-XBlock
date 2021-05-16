"""TO-DO: Write a description of what this XBlock is."""

import datetime
import logging
import requests
import os

import pkg_resources
from web_fragments.fragment import Fragment
from xblock.core import XBlock
from xblock.fields import Scope, List, String, Dict
from xblockutils.resources import ResourceLoader

# Make '_' a no-op so we can scrape strings
_ = lambda text: text
loader = ResourceLoader(__name__)
log = logging.getLogger(__name__)


def resource_string(path):
    """Handy helper for getting resources from our kit."""
    data = pkg_resources.resource_string(__name__, path)
    return data.decode("utf8")


class ELabXBlock(XBlock):
    # Fields are defined on the class.  You can access them in your code as
    # self.<fieldname>.

    has_score = True
    title = String(help="Title of the problem", default="", scope=Scope.content)
    description = String(help="Description about the problem such as instruction", default="", scope=Scope.content)
    programing_language = String(help="Programming langauge that need to use in this problem", default="python",
                                 scope=Scope.content)

    editor_content = String(default="<div></div>", scope=Scope.content)
    input_list = List(default=[{'i': 0, 'value': ''}], scope=Scope.content)
    student_contents = String(default="<div></div>", scope=Scope.content)
    answer_contents = Dict(default="", scope=Scope.content)
    answer_keys = List(default=[], scope=Scope.content)
    task_id = String(default="", scope=Scope.content)
    sources = String(default="<div></div>", scope=Scope.content)

    # Use Scope.user_state when on production
    grading_results = List(default=[], scope=Scope.user_state)
    student_inputs = Dict(default={}, scope=Scope.user_state)

    TINYMCE_API_KEY = os.environ.get('TINYMCE_API_KEY')

    available_languages = {
        'python': 'Python',
        'python2': 'Python 2',
        'python3': 'Python 3',
        'csharp': 'C#',
        'java': 'Java',
        'c': 'C',
        'cplusplus': 'C++',
        'cplusplus11': 'C++11',
        'plaintext': 'Plain Text',
        'makefile': 'Makefile',
        'shellscript': 'Shell script'
    }

    def student_view(self, context=None):
        """
        The primary view of the ELabXBlock, shown to students
        when viewing courses.
        """
        context_html = {'title': self.title,
                        'description': self.description,
                        'programing_language': self.available_languages[self.programing_language],
                        'student_content': self.student_contents,
                        'student_inputs': self.student_inputs,
                        'input_list': self.input_list,
                        'grading_results': self.grading_results
                        }
        template = loader.render_django_template(
            'static/html/student.html',
            context=context_html
        )

        frag = Fragment(template)
        frag.add_css(resource_string("static/css/elabxblock.css"))
        frag.add_javascript(resource_string("static/js/src/student.js"))
        frag.initialize_js('Student')
        return frag

    def studio_view(self, context=None):
        """
        The primary view of the ELabXBlock, shown to students
        when viewing courses.
        """
        context_html = {'title': self.title, 'description': self.description,
                         'programing_language': self.programing_language,
                        'input_list': self.input_list, 'pl': self.available_languages,
                        'editor_content': self.editor_content, 'tinymce_api_key': self.TINYMCE_API_KEY}
        template = loader.render_django_template(
            'static/html/studio.html',
            context=context_html
        )

        frag = Fragment(template)
        frag.add_css(resource_string("static/css/elabxblock.css"))
        frag.add_javascript(resource_string("static/js/src/studio.js"))
        frag.initialize_js('Studio')
        return frag

    @XBlock.json_handler
    def submit_answer(self, data, suffix=''):
        self.student_inputs = data['student_inputs']
        print("step1")
        post_answer = self.post_answer()
        print(post_answer['submit_id'])
        return {"success": 1, "submit_id": post_answer['submit_id']}
        

    @XBlock.json_handler
    def get_score(self, data, suffix=''):
        self.grading_results = data['gradingResult']

        submission_score = self.map_score(self.grading_results)
        max_score = len(self.grading_results)

        self.runtime.publish(self, "grade",
                    { 'value': submission_score,
                      'max_value': max_score })

        return {"success": 1}

    @XBlock.json_handler
    def save_data(self, data, suffix=''):

        if not data['title']:
            return {"success": 0, "data": 'title'}
        if not data['description']:
            return {"success": 0, "data": 'description'}
        if not data['programing_language']:
            return {"success": 0, "data": 'programing_language'}

        self.title = data['title']
        self.description = data['description']
        # self.runtime_limit = data['runtime_limit']
        # self.memory_limit = data['memory_limit']
        self.programing_language = data['programing_language']
        self.editor_content = data['editor_content']
        self.student_contents = data['student_content']
        self.answer_contents = data['answer_content']
        self.sources = data['sources']
        print(self.sources)

        listInput = data['listInput']
        inputs = []
        for i in range(len(listInput)):
            inputs.append({
                'i': i,
                'value': listInput[i]
            })
        self.input_list = inputs
        # self.student_inputs = {}

        self.create_task()

        return {"success": 1}

    def map_score(self, grading_results):
        score = 0
        for i in range(len(grading_results)):
            if grading_results[i] == "P":
                score += 1

        return score

    def post_answer(self):
        url = "https://kulomb.pknn.dev/elab/api/tasks/submit/"

        student_answers = self.student_inputs['sourceSpan']
        answer_group = dict()

        for i in range(len(student_answers)):
            parameter_name = self.answer_keys[i]
            answer_group[parameter_name] = student_answers[i]

        payload = {"answer": answer_group}
        # print(payload)

        response = requests.post(url + self.task_id, json=payload)
        # print("--- post_answer: response ---")
        # print(response.json()) 

        res_body = response.json()
        submit_id = str(res_body["id"])
        # print("here3")
        # results = self.get_submit_status(submit_id)
        # print(results)
        # print("here4")
        return {'submit_id': submit_id}

    # def get_submit_status(self, submit_id):
    #     url = "https://kulomb.pknn.dev/api/tasks/submit/status/"
    #     response = requests.get(url + submit_id)
    #     print("--- get_submit_status: response ---")
    #     print(response.json())
    #     res_body = response.json()
    #     results = res_body["results"]
    #
    #     return results

    def create_task(self):
        url = "https://kulomb.pknn.dev/api/tasks"

        test_cases = []
        for i in range(len(self.input_list)):
            test_cases.append(self.input_list[i]["value"])

        request_body = {
            "name": self.title,
            "description": self.description,
            "language": self.programing_language,
            "test_cases": test_cases,
            "source": self.sources
        }

        response = requests.post(url, json=request_body)
        print(response.status_code)
        res_body = response.json()
        print(response.json())
        self.answer_keys = res_body["answer_keys"]
        self.task_id = str(res_body["id"])
        print(self.answer_keys)
        print(self.task_id)


    @XBlock.json_handler
    def increase_input(self, data, suffix=''):
        self.input_list.append({'i': len(self.input_list), 'value': ''})

        return {"input_list": self.input_list}

    # workbench while developing your XBlock.
    @staticmethod
    def workbench_scenarios():
        """A canned scenario for display in the workbench."""
        return [
            ("ELabXBlock",
             """<elabxblock/>
             """)
        ]
