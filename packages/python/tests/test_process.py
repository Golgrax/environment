import os
import sys
import unittest

from src.process.process import Process


class TestProcess(unittest.TestCase):
    def setUp(self):
        self.p = Process()

    def test_get_process_id(self):
        self.assertEqual(self.p.get_process_id(), os.getpid())

    def test_get_command_line_arguments(self):
        self.assertEqual(self.p.get_command_line_arguments(), sys.argv)


if __name__ == "__main__":
    unittest.main()
