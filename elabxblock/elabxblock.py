"""TO-DO: Write a description of what this XBlock is."""

import pkg_resources
import logging
from web_fragments.fragment import Fragment
from xblock.core import XBlock
from xblock.fields import Integer, Scope, List
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
    """
    TO-DO: document what your XBlock does.
    """

    # Fields are defined on the class.  You can access them in your code as
    # self.<fieldname>.

    count = Integer(
        default=0, scope=Scope.user_state,
        help="A simple counter, to show something happening",
    )
    input_list = List(default=[{'i': 0, 'value': ''}])

    def student_view(self, context=None):
        """
        The primary view of the ELabXBlock, shown to students
        when viewing courses.
        """
        context_html = {'count': self.count, 'input_list': self.input_list}
        template = loader.render_django_template(
            'static/html/elabxblock.html',
            context=context_html
        )

        # html = resource_string("static/html/elabxblock.html")
        frag = Fragment(template)
        frag.add_css(resource_string("static/css/elabxblock.css"))
        frag.add_javascript(resource_string("static/js/src/elabxblock.js"))
        frag.initialize_js('ELabXBlock')
        return frag

    # TO-DO: change this handler to perform your own actions.  You may need more
    # than one handler, or you may not need any handlers at all.
    @XBlock.json_handler
    def increment_count(self, data, suffix=''):
        """
        An example handler, which increments the data.
        """
        # Just to show data coming in...
        assert data['hello'] == 'world'

        self.count += 1
        return {"count": self.count}

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
