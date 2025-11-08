import unittest

from src.system.system_environment import SystemEnvironment


class TestSystemEnvironment(unittest.TestCase):
    def setUp(self):
        self.se = SystemEnvironment()

    def test_get_os(self):
        self.assertIsInstance(self.se.get_os(), str)

    def test_get_cpu_info(self):
        cpu_info = self.se.get_cpu_info()
        self.assertIn("model", cpu_info)

    def test_get_memory_info(self):
        mem_info = self.se.get_memory_info()
        self.assertIn("total", mem_info)

    # The 'set' and 'remove' methods are not tested as they require sudo permissions.


if __name__ == "__main__":
    unittest.main()
