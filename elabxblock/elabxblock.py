"""TO-DO: Write a description of what this XBlock is."""

import logging

import pkg_resources
from web_fragments.fragment import Fragment
from xblock.core import XBlock
from xblock.fields import Scope, List, String
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

    title = String(help="Title of the problem", default="", scope=Scope.content)
    description = String(help="Description about the problem such as instruction", default="", scope=Scope.content)
    runtime_limit = String(help="Runtime limit for compiling", default="", scope=Scope.content)
    memory_limit = String(help="Memory limit for compiling", default="", scope=Scope.content)
    programing_language = String(help="Programming langauge that need to use in this problem", default="python",
                                 scope=Scope.content)

    editor_content = String(default="<div></div>", scope=Scope.content)
    input_list = List(default=[{'i': 0, 'value': ''}], scope=Scope.content)
    answers = List(default=["asdasd"], scope=Scope.content)
    source_codes = List(default=["asdadasdas"], scope=Scope.content)

    PROGRAMING_LANGUAGE = {
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
                        'runtime_limit': self.runtime_limit,
                        'memory_limit': self.memory_limit,
                        'programing_language': self.PROGRAMING_LANGUAGE[self.programing_language],
                        'test_case_len': len(self.input_list),
                        'editor_content': self.editor_content
                        }
        template = loader.render_django_template(
            'static/html/student.html',
            context=context_html
        )
        # html = resource_string("static/html/studio.html")
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
        context_html = {'title': self.title, 'description': self.description, 'runtime_limit': self.runtime_limit,
                        'memory_limit': self.memory_limit, 'programing_language': self.programing_language,
                        'input_list': self.input_list, 'pl': self.PROGRAMING_LANGUAGE,
                        'editor_content': self.editor_content, 'answers': self.answers,
                        'source_codes': self.source_codes}
        template = loader.render_django_template(
            'static/html/studio.html',
            context=context_html
        )

        # html = resource_string("static/html/studio.html")
        frag = Fragment(template)
        frag.add_css(resource_string("static/css/elabxblock.css"))
        frag.add_javascript(resource_string("static/js/src/studio.js"))
        frag.initialize_js('Studio')
        return frag

    @XBlock.json_handler
    def save_data(self, data, suffix=''):
        for key in data:
            if not data[key] and key != 'listInput':
                return {"success": 0, "data": key}

        self.title = data['title']
        self.description = data['description']
        self.runtime_limit = data['runtime_limit']
        self.memory_limit = data['memory_limit']
        self.programing_language = data['programing_language']
        self.editor_content = data['editor_content']
        self.answers = data['answers']
        self.source_codes = data['sourcecodes']

        listInput = data['listInput']
        inputs = []
        for i in range(len(listInput)):
            inputs.append({
                'i': i,
                'value': listInput[i]
            })
        self.input_list = inputs
        return {"success": 1}

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
