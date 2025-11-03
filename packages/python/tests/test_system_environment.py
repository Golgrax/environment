import unittest
from environment.system_environment import SystemEnvironment

class TestSystemEnvironment(unittest.TestCase):

    def setUp(self):
        self.se = SystemEnvironment()

    def test_getOS(self):
        self.assertIsInstance(self.se.getOS(), str)

    def test_getCPU(self):
        cpu_info = self.se.getCPU()
        self.assertIsInstance(cpu_info, dict)
        self.assertIn("model", cpu_info)
        self.assertIn("cores", cpu_info)
        self.assertIn("speed", cpu_info)

    def test_getMemory(self):
        mem_info = self.se.getMemory()
        self.assertIsInstance(mem_info, dict)
        self.assertIn("total", mem_info)
        self.assertIn("free", mem_info)

    def test_get(self):
        # This test assumes a common environment variable like PATH exists
        self.assertIsNotNone(self.se.get("PATH"))

    def test_listKeys(self):
        keys = self.se.listKeys()
        self.assertIsInstance(keys, list)
        self.assertIn("PATH", keys)

    def test_listValues(self):
        values = self.se.listValues()
        self.assertIsInstance(values, list)
        self.assertTrue(any(isinstance(v, str) for v in values))

    # The 'set' and 'remove' methods are not tested as they require sudo permissions.

if __name__ == '__main__':
    unittest.main()
