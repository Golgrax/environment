import unittest
import os
import tempfile
from environment.user_environment import UserEnvironment

class TestUserEnvironment(unittest.TestCase):

    def setUp(self):
        self.ue = UserEnvironment()
        self.test_dir = tempfile.TemporaryDirectory()
        self.bashrc_path = os.path.join(self.test_dir.name, ".bashrc")
        os.environ["HOME"] = self.test_dir.name

    def tearDown(self):
        self.test_dir.cleanup()
        del os.environ["HOME"]

    def test_get_set_remove_list(self):
        self.ue.set("TEST_VAR", "test_value")
        self.assertEqual(self.ue.get("TEST_VAR"), "test_value")

        self.ue.set("ANOTHER_VAR", "another_value")
        self.assertEqual(self.ue.get("ANOTHER_VAR"), "another_value")

        self.assertCountEqual(self.ue.listKeys(), ["TEST_VAR", "ANOTHER_VAR"])
        self.assertCountEqual(self.ue.listValues(), ["test_value", "another_value"])

        self.ue.remove("TEST_VAR")
        self.assertIsNone(self.ue.get("TEST_VAR"))
        self.assertEqual(self.ue.listKeys(), ["ANOTHER_VAR"])

if __name__ == '__main__':
    unittest.main()
