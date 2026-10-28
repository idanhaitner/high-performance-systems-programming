import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
SCRIPT = HERE / "export_course.py"
TESTDATA = HERE / "testdata"


def run_export(root):
    return subprocess.run(
        [sys.executable, str(SCRIPT), "--root", str(root)], capture_output=True, text=True
    )


class ExportTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        result = run_export(TESTDATA)
        assert result.returncode == 0, result.stderr
        cls.course = json.loads(result.stdout)
        cls.session = cls.course["sessions"][0]

    def test_lecture_has_session_id(self):
        self.assertEqual(self.course["lectures"][0]["sessionId"], "lecture-1")

    def test_step_kinds(self):
        kinds = [step["kind"] for step in self.session["steps"]]
        self.assertEqual(kinds, ["learn", "learn", "check", "exercise", "exercise", "lab"])
        self.assertEqual(self.session["lectureId"], "lecture-1")

    def test_learn_from_section(self):
        step = self.session["steps"][0]
        self.assertEqual(step["title"], "Pointers & Arrays")
        self.assertEqual(step["id"], "learn:topic-one#pointers-arrays")
        self.assertTrue(all(b["type"] != "heading" for b in step["blocks"]))
        self.assertEqual(step["blocks"][0]["text"], "Text about pointers.")

    def test_check_step(self):
        step = self.session["steps"][2]
        self.assertEqual(step["id"], "chk-x")
        self.assertEqual(step["block"]["name"], "check")

    def test_function_exercise(self):
        ex = self.session["steps"][3]["exercise"]
        self.assertEqual(ex["mode"], "function")
        self.assertEqual(ex["caseNames"], ["positives", "negatives"])
        self.assertEqual(len(ex["hints"]), 2)
        self.assertEqual(list(ex["caseHints"]), ["negatives"])
        self.assertIsNotNone(ex["test"])
        self.assertEqual(ex["cases"], [])

    def test_program_exercise(self):
        ex = self.session["steps"][4]["exercise"]
        self.assertEqual(ex["mode"], "program")
        self.assertEqual(ex["cases"][0]["args"], ["3", "4"])
        self.assertEqual(ex["cases"][0]["stdin"], "")
        self.assertIsNone(ex["test"])

    def test_harness_and_lab(self):
        expected = (TESTDATA / "study/content/exercises/harness.h").read_text()
        self.assertEqual(self.course["harness"], expected)
        lab = self.session["steps"][5]["lab"]
        self.assertEqual(lab["zip"], "/labs/lab-one.zip")


class ValidationTests(unittest.TestCase):
    def broken(self, mutate, expect):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "root"
            shutil.copytree(TESTDATA, root)
            mutate(root / "study/content")
            result = run_export(root)
        self.assertEqual(result.returncode, 1, result.stdout[:200])
        self.assertIn(expect, result.stderr)

    def edit(self, rel, old, new):
        def mutate(content):
            path = content / rel
            text = path.read_text()
            assert old in text, (rel, old)
            path.write_text(text.replace(old, new))
        return mutate

    def test_unknown_from_slug(self):
        self.broken(self.edit("sessions/lecture-1.md", "#pointers-arrays", "#nope"), "topic-one#nope")

    def test_unknown_check_ref(self):
        self.broken(self.edit("sessions/lecture-1.md", "ref=chk-x", "ref=chk-zzz"), "chk-zzz")

    def test_unknown_exercise_ref(self):
        self.broken(self.edit("sessions/lecture-1.md", "ref=add-two", "ref=ghost"), "ghost")

    def test_unknown_lab_ref(self):
        self.broken(self.edit("sessions/lecture-1.md", "ref=lab-one", "ref=ghost-lab"), "ghost-lab")

    def test_both_test_and_cases(self):
        def mutate(content):
            shutil.copy(content / "exercises/sum-args/cases.yml", content / "exercises/add-two/cases.yml")
        self.broken(mutate, "exactly one of test.c or cases.yml")

    def test_neither_test_nor_cases(self):
        self.broken(lambda c: (c / "exercises/add-two/test.c").unlink(), "exactly one of test.c or cases.yml")

    def test_zero_cases(self):
        def mutate(content):
            (content / "exercises/sum-args/cases.yml").write_text("cases: []\n")
        self.broken(mutate, "1 to 3 cases")

    def test_four_cases(self):
        def mutate(content):
            item = "  - name: c{}\n    args: [1, 2]\n    expected: \"3\\n\"\n"
            (content / "exercises/sum-args/cases.yml").write_text(
                "cases:\n" + "".join(item.format(i) for i in range(4))
            )
        self.broken(mutate, "1 to 3 cases")

    def test_missing_starter(self):
        self.broken(lambda c: (c / "exercises/add-two/starter.c").unlink(), "missing starter.c")

    def test_missing_solution(self):
        self.broken(lambda c: (c / "exercises/add-two/solution.c").unlink(), "missing solution.c")

    def test_case_hint_not_a_case(self):
        self.broken(self.edit("exercises/add-two/README.md", 'name="negatives"', 'name="bogus"'), "bogus")

    def test_session_lecture_unknown(self):
        self.broken(self.edit("sessions/lecture-1.md", "lecture: lecture-1", "lecture: lecture-9"), "lecture must be lecture-1")

    def test_session_file_missing(self):
        self.broken(lambda c: (c / "sessions/lecture-1.md").unlink(), "session file")


if __name__ == "__main__":
    unittest.main()
