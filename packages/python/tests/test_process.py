import unittest
import os
import sys
from environment.process import Process

class TestProcess(unittest.TestCase):

    def setUp(self):
        self.p = Process()

    def test_get_process_id(self):
        self.assertEqual(self.p.get_process_id(), os.getpid())

    def test_get_command_line_arguments(self):
        self.assertEqual(self.p.get_command_line_arguments(), sys.argv)

    def test_get_memory_usage(self):
        self.assertIsNotNone(self.p.get_memory_usage())

if __name__ == '__main__':
    unittest.main()
