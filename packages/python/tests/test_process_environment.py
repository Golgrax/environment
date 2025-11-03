import unittest
import os
import getpass
from environment.process_environment import ProcessEnvironment

class TestProcessEnvironment(unittest.TestCase):

    def setUp(self):
        self.pe = ProcessEnvironment()

    def test_get_user_name(self):
        self.assertEqual(self.pe.get_user_name(), getpass.getuser())

    def test_get_home_directory(self):
        self.assertEqual(self.pe.get_home_directory(), os.path.expanduser("~"))

if __name__ == '__main__':
    unittest.main()
